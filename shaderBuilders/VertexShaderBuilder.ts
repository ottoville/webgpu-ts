import type { BindGroupLayoutEntry } from '../BindgroupLayout';
import type { RenderPipelineLayout } from '../pipelineLayots/RenderPipelineLayout';
import type {
  AnyVertexStage,
  VertexShaderFunction,
} from '../shaderFunctions/VertexShaderFunction';
import { AbstractShader } from '../shaders/AbstractShader.js';
import {
  type VertexBufferLayout,
  type VertexEntry,
  VertexShader,
} from '../shaders/VertexShader.js';
import type { Struct, wgslType } from '../Struct';
import type { FilteredBindgroupEntrys, LayoutEntries } from '../Utilities';

export class VertexShaderBuilder<
  E extends {
    [index: string]: VertexShaderFunction;
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  } = {},
  P extends readonly RenderPipelineLayout[] = readonly RenderPipelineLayout[],
> extends AbstractShader<E, P> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  #constantCode: ((args: any) => string) | undefined;
  constructor(
    public override pipelineLayouts: P,
    label: string,
    constantCode?: (
      args: FilteredBindgroupEntrys<P[number]['bindGroupLayouts'], VertexEntry>,
    ) => string,
  ) {
    super(pipelineLayouts, label);
    this.#constantCode = constantCode;
  }
  /**
   * Add vertex function
   * @param this
   * @param entryPoint
   * @param shaderFunction
   */
  addFunction<
    S extends string,
    F extends readonly {
      [index: string]: BindGroupLayoutEntry<AnyVertexStage>;
    }[],
    V extends readonly VertexBufferLayout[] | readonly [],
    O extends [properties: string, type: wgslType] | Struct,
    RP extends readonly RenderPipelineLayout[],
  >(
    entryPoint: P extends readonly LayoutEntries<F>[] ? S : never,
    shaderFunction: VertexShaderFunction<F, V, O>,
  ) {
    const newBuilder = new VertexShaderBuilder<
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
    return new VertexShader({
      constantCode: this.#constantCode,
      entryPoints: this.entryPoints,
      label: this.label,
      pipelineLayouts: this.pipelineLayouts,
    });
  }
}
