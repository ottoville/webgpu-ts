import type { BindGroupLayoutEntry } from '../BindgroupLayout.js';
import type { ShaderStage } from '../shaders/Shader.js';
import { Struct, type wgslType } from '../Struct.js';
import type { FilteredBindEntrys } from '../Utilities.js';
import type {
  VertexBufferLayout,
  VertexEntry,
} from '../shaders/VertexShader.js';

export type AnyVertexStage =
  | ShaderStage.VERTEX
  | ShaderStage.COMPUTE_AND_VERTEX
  | ShaderStage.VERTEX_AND_FRAGMENT
  | ShaderStage.COMPUTE_AND_VERTEX_AND_FRAGMENT;

type VertexShaderCode = readonly [
  string,
  Set<(typeof VertexBuildinNames)[keyof typeof VertexBuildinNames]>,
];

export enum VertexBuildin {
  instance_index = 'buildinInstanceIndex',
  vertex_index = 'buildinVertexIndex',
  position = 'buildinPosition',
}

export const VertexBuildinNames = {
  buildinInstanceIndex: ['instance_index', 'u32'],
  buildinPosition: ['position', 'vec4<f32>'],
  buildinVertexIndex: ['vertex_index', 'u32'],
} as const;

export function WGSLcode(
  parts: TemplateStringsArray,
  ...exps: (VertexBuildin | string)[]
) {
  const buildIns: Set<
    (typeof VertexBuildinNames)[keyof typeof VertexBuildinNames]
  > = new Set();
  const glued: string[] = [];
  parts.reduce((acc, curr, index) => {
    const exp = exps[index];
    if (typeof exp === 'undefined') {
      acc.push(curr);
      return acc;
    }
    if (
      typeof VertexBuildinNames[exp as keyof typeof VertexBuildinNames] !==
      'undefined'
    ) {
      buildIns.add(VertexBuildinNames[exp as keyof typeof VertexBuildinNames]);
    }
    acc.push(curr, exp);
    return acc;
  }, glued);

  return [glued.join(''), buildIns] as const;
}
let id = 0;
export class VertexBufferLayouts<
  const V extends readonly VertexBufferLayout[],
> {
  readonly #vertexBufferLayout: V;
  readonly attributesString: string[] = [];
  readonly variableNames = [] as {
    [K in keyof V]: { [KK in keyof V[K]['struct']['properties']]: KK };
  };
  readonly buffers: GPUVertexBufferLayout[] = [];
  id = id++;
  constructor(vertexBufferLayout: V) {
    this.#vertexBufferLayout = Object.freeze(vertexBufferLayout);

    let shaderLocation = 0;
    this.#vertexBufferLayout.forEach((buffer) => {
      const vertexAttributes: GPUVertexAttribute[] = [];
      const r: GPUVertexBufferLayout = {
        arrayStride: buffer.struct.stride,
        attributes: [],
      };
      const variableNames: Record<string, string> = {};
      (this.variableNames as Record<string, string>[]).push(variableNames);
      for (const varName in buffer.struct.properties) {
        const nameInShader = `${varName}${shaderLocation}`;
        variableNames[varName] = nameInShader;

        const property = buffer.struct.properties[varName]!;
        this.attributesString.push(
          `@location(${shaderLocation}) ${nameInShader} : ${property.overrideVertexType ?? property.type}`,
        );
        vertexAttributes.push(
          Object.freeze({
            format: property.vertexFormat,
            offset: property.offset,
            shaderLocation: shaderLocation++,
          }) as GPUVertexAttribute,
        );
      }
      r.attributes = vertexAttributes;
      if (buffer.stepMode) {
        r.stepMode = buffer.stepMode;
      }
      this.buffers.push(r);
    });
  }
}

export class VertexShaderFunction<
  const B extends readonly {
    [index: string]: BindGroupLayoutEntry<AnyVertexStage>;
  }[] = readonly { [index: string]: BindGroupLayoutEntry<AnyVertexStage> }[],
  const V extends readonly VertexBufferLayout[] | readonly [] =
    | readonly VertexBufferLayout[]
    | readonly [],
  O extends [properties: string, type: wgslType] | Struct =
    | [properties: string, type: wgslType]
    | Struct,
> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  #code: (args: any, bufferArgs: any) => VertexShaderCode;
  constructor(
    public output: O,
    public readonly vertexBufferLayouts: VertexBufferLayouts<V>,
    code: (
      args: FilteredBindEntrys<B, VertexEntry>,
      bufferArgs: Readonly<{
        [K in keyof V]: {
          [KK in keyof V[K]['struct']['properties']]: KK;
        };
      }>,
    ) => VertexShaderCode,
    public label: string = '',
  ) {
    this.#code = code;
  }
  createCode(bindGroups: FilteredBindEntrys<B, VertexEntry>, name: string) {
    const [code, buildins] = this.#code(
      bindGroups,
      this.vertexBufferLayouts.variableNames,
    );
    const attributesString: string[] = [
      ...this.vertexBufferLayouts.attributesString,
      ...buildins
        .values()
        .map(
          (buildin) =>
            `@builtin(${buildin[0]}) ${VertexBuildin[buildin[0]]} : ${buildin[1]}`,
        ),
    ];
    const wgsl = /* wgsl */ `
            @vertex
            fn ${name}(
                ${attributesString.join(',\n')}
                ) -> ${
                  this.output instanceof Struct
                    ? this.output.name
                    : this.output.join(' ')
                } {
                    ${code}
                }`;
    return wgsl;
  }
}
