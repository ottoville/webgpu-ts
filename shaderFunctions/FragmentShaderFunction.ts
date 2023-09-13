import type { BindGroupLayoutEntry } from '../BindgroupLayout';
import type { ShaderStage } from '../shaders/Shader';
import type { Struct, wgslType } from '../Struct';
import type { FilteredBindEntrys } from '../Utilities';
import type { FragmentEntry } from '../shaders/FragmentShader';

export type AnyFragmentStage =
  | ShaderStage.FRAGMENT
  | ShaderStage.COMPUTE_AND_FRAGMENT
  | ShaderStage.VERTEX_AND_FRAGMENT
  | ShaderStage.COMPUTE_AND_VERTEX_AND_FRAGMENT;

export class FragmentShaderFunction<
  const B extends readonly {
    [index: string]: BindGroupLayoutEntry<AnyFragmentStage>;
    // eslint-disable-next-line @typescript-eslint/ban-types
  }[] = readonly {}[],
> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  #code: (args: any) => string;
  constructor(
    public output: [properties: string, type: wgslType] | Struct,
    /* TODO: use struct array from vertex shader output */
    private inputs: Struct | undefined,
    code: (args: FilteredBindEntrys<B, FragmentEntry>) => string,
  ) {
    this.#code = code;
  }
  createCode(bindGroups: FilteredBindEntrys<B, FragmentEntry>, name: string) {
    const wgsl = /* wgsl */ `
                @fragment
                fn ${name}(
                    ${this.inputs?.getPropertiesAsString() ?? ''}
                    ) -> this.output instanceof Struct
                    ? this.output.name
                    : this.output.concat(' ')
                    {
                        ${this.#code(bindGroups)}
                    }`;
    return wgsl;
  }
}
