import type { BindGroupLayoutEntry } from '../BindgroupLayout';
import type { PipelineLayout } from '../pipelineLayots/PipelineLayout';
import type {
  AnyComputeStage,
  ComputeShaderFunction,
} from '../shaderFunctions/ComputeShaderFunction';
import { type ComputeEntry, ComputeShader } from '../shaders/ComputeShader.js';
import type { FilteredBindgroupEntrys, LayoutEntries } from '../Utilities';
import { ShaderBuilder } from './ShaderBuilder.js';

export class ComputeShaderBuilder<
  // eslint-disable-next-line @typescript-eslint/ban-types
  E extends { [index: string]: ComputeShaderFunction } = {},
  P extends readonly PipelineLayout[] = readonly PipelineLayout[],
> extends ShaderBuilder<P, E> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  #constantCode: ((args: any) => string) | undefined;
  constructor(
    pipelineLayouts: P,
    label: string,
    constantCode?: (
      args: FilteredBindgroupEntrys<
        P[number]['bindGroupLayouts'],
        ComputeEntry
      >,
    ) => string,
  ) {
    super(pipelineLayouts, label);
    this.#constantCode = constantCode;
  }
  /**
   * Add compute function
   * @param this
   * @param entryPoint
   * @param shaderFunction
   */
  addFunction<
    S extends string,
    F extends readonly {
      [index: string]: BindGroupLayoutEntry<AnyComputeStage>;
    }[],
    PL extends readonly PipelineLayout[],
  >(
    this: ShaderBuilder<PL, E>,
    entryPoint: P extends readonly LayoutEntries<F>[] ? S : never,
    shaderFunction: ComputeShaderFunction<F>,
  ) {
    const newBuilder = new ComputeShaderBuilder<
      E & Record<S, typeof shaderFunction>,
      P extends PL ? P : never
      //@ts-expect-error
    >(this.pipelineLayouts, this.label, this.#constantCode);

    newBuilder.entryPoints = {
      ...this.entryPoints,
      [entryPoint]: shaderFunction,
    };
    return newBuilder;
  }
  build() {
    return new ComputeShader({
      constantCode: this.#constantCode,
      entryPoints: this.entryPoints,
      label: this.label,
      pipelineLayouts: this.pipelineLayouts,
    });
  }
}
