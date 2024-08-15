import type { BindGroupLayoutEntry } from '../BindgroupLayout.js';
import type { ShaderStage } from '../shaders/Shader.js';
import type { FilteredBindEntrys } from '../Utilities.js';
import type { ComputeEntry } from '../shaders/ComputeShader.js';

export type AnyComputeStage =
  | ShaderStage.COMPUTE
  | ShaderStage.COMPUTE_AND_FRAGMENT
  | ShaderStage.COMPUTE_AND_VERTEX
  | ShaderStage.COMPUTE_AND_VERTEX_AND_FRAGMENT;

export class ComputeShaderFunction<
  B extends readonly {
    [index: string]: BindGroupLayoutEntry<AnyComputeStage>;
  }[] = readonly {
    [index: string]: BindGroupLayoutEntry<AnyComputeStage>;
  }[],
> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  #code: (args: any) => string;
  constructor(
    /* TODO: use const enumns */
    private inputs: string,
    private readonly workgroupSize: readonly [
      x: number,
      y?: number,
      z?: number,
    ],
    code: (args: FilteredBindEntrys<B, ComputeEntry>) => string,
    public label: string = '',
  ) {
    this.#code = code;
  }
  createCode(bindGroups: FilteredBindEntrys<B, ComputeEntry>, name: string) {
    const wgsl = /* wgsl */ `
                @compute @workgroup_size(${this.workgroupSize.join()})
                fn ${name} (
                    ${this.inputs}
                    ) {
                        ${this.#code(bindGroups)}
                    }`;
    return wgsl;
  }
}
