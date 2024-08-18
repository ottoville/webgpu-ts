import type { BindGroupLayoutEntry } from '../BindgroupLayout';
import type { RenderPipelineLayout } from '../pipelineLayots/RenderPipelineLayout';
import type {
  AnyFragmentStage,
  FragmentShaderFunction,
} from '../shaderFunctions/FragmentShaderFunction';
import { AbstractShader } from '../shaders/AbstractShader.js';
import {
  type FragmentEntry,
  FragmentShader,
} from '../shaders/FragmentShader.js';
import type { Struct, wgslType } from '../Struct';
import type { FilteredBindgroupEntrys, LayoutEntries } from '../Utilities';

export class FragmentShaderBuilder<
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  E extends { [index: string]: FragmentShaderFunction } = {},
  P extends readonly RenderPipelineLayout[] = readonly RenderPipelineLayout[],
> extends AbstractShader<E, P> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  #constantCode: ((args: any) => string) | undefined;
  constructor(
    pipelineLayouts: P,
    label: string,
    constantCode?: (
      args: FilteredBindgroupEntrys<
        P[number]['bindGroupLayouts'],
        FragmentEntry
      >,
    ) => string,
  ) {
    super(pipelineLayouts, label);
    this.#constantCode = constantCode;
  }
  /**
   * Add fragment function
   * @param this
   * @param entryPoint
   * @param shaderFunction
   */
  addFunction<
    S extends string,
    F extends readonly {
      [index: string]: BindGroupLayoutEntry<AnyFragmentStage>;
    }[],
    I extends [properties: string, type: wgslType] | Struct | undefined,
    RP extends readonly RenderPipelineLayout[],
  >(
    entryPoint: P extends readonly LayoutEntries<F>[] ? S : never,
    shaderFunction: FragmentShaderFunction<F, I>,
  ) {
    const newBuilder = new FragmentShaderBuilder<
      E & Record<S, typeof shaderFunction>,
      P extends RP ? P : never
      //@ts-expect-error todo
    >(this.pipelineLayouts, this.label, this.#constantCode);

    newBuilder.entryPoints = {
      ...this.entryPoints,
      [entryPoint]: shaderFunction,
    };
    return newBuilder;
  }
  build() {
    return new FragmentShader({
      constantCode: this.#constantCode,
      entryPoints: this.entryPoints,
      label: this.label,
      pipelineLayouts: this.pipelineLayouts,
    });
  }
}
