import type { BindGroupLayoutEntry } from '../BindgroupLayout';
import { ShaderStage } from '../shaders/Shader';
import type { ComputeShaderBuilder } from '../ShaderBuilder';
import type {
  FilteredBindEntrys,
  LayoutEntries,
  RemoveIndexSignature,
} from '../Utilities';
import type { ComputeEntry } from '../shaders/ComputeShader';

type AnyComputeStage =
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
  ) {
    this.#code = code;
  }
  addToShaderBuilder<
    E extends string,
    S extends ComputeShaderBuilder<
      { [index: string]: ComputeShaderFunction },
      readonly LayoutEntries<B>[]
    >,
  >(entryPoint: E, shaderBuilder: S) {
    if (entryPoint in shaderBuilder.entryPoints) {
      console.warn('Overriding existing shaderfunction in shaderbuilder.');
    }
    shaderBuilder.entryPoints[entryPoint] = this;
    return shaderBuilder as unknown as S extends ComputeShaderBuilder<
      infer EE,
      infer L
    >
      ? ComputeShaderBuilder<
          RemoveIndexSignature<EE & Record<typeof entryPoint, this>>,
          L
        >
      : never;
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
