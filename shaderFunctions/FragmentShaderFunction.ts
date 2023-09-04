import type { BindGroupLayoutEntry } from '../BindgroupLayout';
import type { ShaderStage } from '../shaders/Shader';
import type { FragmentShaderBuilder } from '../ShaderBuilder';
import type { Struct } from '../Struct';
import type {
  FilteredBindEntrys,
  LayoutEntries,
  RemoveIndexSignature,
} from '../Utilities';
import type { FragmentEntry } from '../shaders/FragmentShader';

type AnyFragmentStage =
  | ShaderStage.FRAGMENT
  | ShaderStage.COMPUTE_AND_FRAGMENT
  | ShaderStage.VERTEX_AND_FRAGMENT
  | ShaderStage.COMPUTE_AND_VERTEX_AND_FRAGMENT;

export class FragmentShaderFunction<
  B extends readonly {
    [index: string]: BindGroupLayoutEntry<AnyFragmentStage>;
  }[] = readonly { [index: string]: BindGroupLayoutEntry<AnyFragmentStage> }[],
> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  #code: (args: any) => string;
  constructor(
    public output: Struct,
    /* TODO: use struct array from vertex shader output */
    private inputs: Struct | undefined,
    code: (args: FilteredBindEntrys<B, FragmentEntry>) => string,
  ) {
    this.#code = code;
  }
  addToShaderBuilder<
    E extends string,
    S extends FragmentShaderBuilder<
      { [index: string]: FragmentShaderFunction },
      readonly LayoutEntries<B>[]
    >,
  >(entryPoint: E, shaderBuilder: S) {
    if (entryPoint in shaderBuilder.entryPoints) {
      console.warn('Overriding existing shaderfunction in shaderbuilder.');
    }
    shaderBuilder.entryPoints[entryPoint] = this;
    return shaderBuilder as unknown as S extends FragmentShaderBuilder<
      infer EE,
      infer L
    >
      ? FragmentShaderBuilder<
          RemoveIndexSignature<EE & Record<typeof entryPoint, this>>,
          L
        >
      : never;
  }
  createCode(bindGroups: FilteredBindEntrys<B, FragmentEntry>, name: string) {
    const wgsl = /* wgsl */ `
                @fragment
                fn ${name}(
                    ${this.inputs?.getPropertiesAsString() ?? ''}
                    ) -> ${this.output.name} {
                        ${this.#code(bindGroups)}
                    }`;
    return wgsl;
  }
}
