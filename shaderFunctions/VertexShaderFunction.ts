import type { BindGroupLayoutEntry } from '../BindgroupLayout.js';
import type { ShaderStage } from '../shaders/Shader.js';
import { Struct, type wgslType } from '../Struct.js';
import type { FilteredBindEntrys } from '../Utilities.js';
import type {
  VertexBufferLayout2,
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

export class VertexShaderFunction<
  const B extends readonly {
    [index: string]: BindGroupLayoutEntry<AnyVertexStage>;
  }[] = readonly { [index: string]: BindGroupLayoutEntry<AnyVertexStage> }[],
  const V extends readonly VertexBufferLayout2[] | readonly [] =
    | readonly VertexBufferLayout2[]
    | readonly [],
> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  #code: (args: any, bufferArgs: any) => VertexShaderCode;
  readonly vertexBufferLayout: V;
  buffers: GPUVertexBufferLayout[] = [];
  constructor(
    public output: [properties: string, type: wgslType] | Struct,
    vertexBufferLayout: V,
    code: (
      args: FilteredBindEntrys<B, VertexEntry>,
      bufferArgs: Readonly<{
        [K in keyof V]: { [KK in keyof V[K]['attributes2']]: KK };
      }>,
    ) => VertexShaderCode,
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
    const [code, buildins] = this.#code(bindGroups, variableNames);
    const wgsl = /* wgsl */ `
            @vertex
            fn ${name}(
                ${[...buildins]
                  .map((buildin) => {
                    return `@builtin(${buildin[0]}) ${
                      VertexBuildin[buildin[0]]
                    } : ${buildin[1]}`;
                  })
                  .join('\n')}
                ${attributesString}
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
