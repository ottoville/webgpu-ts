import type { BindGroupLayoutEntry } from '../BindgroupLayout.js';
import type { ShaderStage } from '../shaders/Shader.js';
import { Struct, type wgslType } from '../Struct.js';
import type { FilteredBindEntrys } from '../Utilities.js';
import type { FragmentEntry } from '../shaders/FragmentShader.js';

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
  I extends [properties: string, type: wgslType] | Struct | undefined =
    | [properties: string, type: wgslType]
    | Struct
    | undefined,
> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  #code: (...args: any) => string;
  constructor(
    public output: [properties: string, type: wgslType] | Struct,
    code: (
      args: FilteredBindEntrys<B, FragmentEntry>,
      inputs: I extends Struct
        ? { [K in keyof I['properties']]: K }
        : undefined,
    ) => string,
    public inputs: I = undefined as I,
    public label: string = '',
  ) {
    this.#code = code;
  }
  createCode(bindGroups: FilteredBindEntrys<B, FragmentEntry>, name: string) {
    var inputs: { [index: string]: string } | undefined = undefined;
    if (this.inputs instanceof Struct) {
      const keys = Object.keys(this.inputs.properties);
      inputs = Object.fromEntries(keys.map((o, i) => [o, keys[i]!]));
    }

    const wgsl = /* wgsl */ `
                @fragment
                fn ${name}(
                    ${
                      this.inputs instanceof Struct
                        ? this.inputs.getPropertiesAsString()
                        : this.inputs?.concat(' ') ?? ''
                    }
                    ) -> ${
                      this.output instanceof Struct
                        ? this.output.name
                        : this.output.join(' ')
                    }
                    {
                        ${this.#code(bindGroups, inputs)}
                    }`;
    return wgsl;
  }
}
