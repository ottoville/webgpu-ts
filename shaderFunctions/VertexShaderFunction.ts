import type { BindGroupLayoutEntry } from '../BindgroupLayout';
import type { ShaderStage } from '../shaders/Shader';
import type { VertexShaderBuilder } from '../ShaderBuilder';
import type { Struct } from '../Struct';
import type {
  FilteredBindEntrys,
  LayoutEntries,
  RemoveIndexSignature,
} from '../Utilities';
import type { VertexBufferLayout2, VertexEntry } from '../shaders/VertexShader';

export type AnyVertexStage =
  | ShaderStage.VERTEX
  | ShaderStage.COMPUTE_AND_VERTEX
  | ShaderStage.VERTEX_AND_FRAGMENT
  | ShaderStage.COMPUTE_AND_VERTEX_AND_FRAGMENT;

export class VertexShaderFunction<
  B extends readonly {
    [index: string]: BindGroupLayoutEntry<AnyVertexStage>;
  }[] = readonly { [index: string]: BindGroupLayoutEntry<AnyVertexStage> }[],
  const V extends readonly VertexBufferLayout2[] | readonly [] =
    | readonly VertexBufferLayout2[]
    | readonly [],
> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  #code: (args: any, bufferArgs: any) => string;
  readonly vertexBufferLayout: V;
  buffers: GPUVertexBufferLayout[] = [];
  constructor(
    public output: Struct,
    vertexBufferLayout: V,
    code: (
      args: FilteredBindEntrys<B, VertexEntry>,
      bufferArgs: Readonly<{
        [K in keyof V]: { [KK in keyof V[K]['attributes2']]: KK };
      }>,
    ) => string,
    // TODO: use enums
    private inputs = '',
  ) {
    this.#code = code;
    this.vertexBufferLayout = Object.freeze(vertexBufferLayout);
    this.buffers = vertexBufferLayout.map((layout) => {
      return {
        ...layout,
        attributes: Object.values(layout.attributes2),
      };
    });
  }
  addToShaderBuilder<
    E extends string,
    BUILDER extends VertexShaderBuilder<
      {
        [index: string]: VertexShaderFunction<
          readonly {
            [index: string]: BindGroupLayoutEntry<AnyVertexStage>;
          }[],
          readonly VertexBufferLayout2[] | readonly []
        >;
      },
      readonly LayoutEntries<B>[]
    >,
  >(entryPoint: E, shaderBuilder: BUILDER) {
    if (entryPoint in shaderBuilder.entryPoints) {
      console.warn('Overriding existing shaderfunction in shaderbuilder.');
    }
    shaderBuilder.entryPoints[entryPoint] = this;
    return shaderBuilder as unknown as BUILDER extends VertexShaderBuilder<
      infer EE,
      infer L
    >
      ? VertexShaderBuilder<
          RemoveIndexSignature<EE & Record<typeof entryPoint, this>>,
          L
        >
      : never;
  }
  createCode(bindGroups: FilteredBindEntrys<B, VertexEntry>, name: string) {
    const variableNames = this.vertexBufferLayout.map((buffer) => {
      const keys = Object.keys(buffer.attributes2);
      return Object.fromEntries(keys.map((o, i) => [o, keys[i]!]));
    }) as { [K in keyof V]: { [KK in keyof V[K]['attributes2']]: KK } };

    let attributesString = '';
    const bufferVariables: string[] = [];
    this.vertexBufferLayout.forEach((buffer) => {
      for (const varName in buffer.attributes2) {
        bufferVariables.push(varName);
        attributesString += `@location(${
          buffer.attributes2[varName]!.shaderLocation
        }) ${varName} : ${buffer.attributes2[varName]!.shaderFormat},\n`;
      }
    });
    const wgsl = /* wgsl */ `
            @vertex
            fn ${name}(
                ${this.inputs}
                ${attributesString}
                ) -> ${this.output.name} {
                    ${this.#code(bindGroups, variableNames)}
                }`;
    return wgsl;
  }
}
