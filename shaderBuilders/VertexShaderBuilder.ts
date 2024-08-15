import type { BindGroupLayoutEntry } from '../BindgroupLayout';
import type { RenderPipelineLayout } from '../pipelineLayots/RenderPipelineLayout';
import type {
  AnyVertexStage,
  VertexShaderFunction,
} from '../shaderFunctions/VertexShaderFunction';
import {
  type VertexBufferLayout2,
  type VertexEntry,
  VertexShader,
} from '../shaders/VertexShader.js';
import type { Struct, wgslType } from '../Struct';
import type { FilteredBindgroupEntrys, LayoutEntries } from '../Utilities';
import { ShaderBuilder } from './ShaderBuilder.js';

export class VertexShaderBuilder<
  E extends {
    [index: string]: VertexShaderFunction;
    // eslint-disable-next-line @typescript-eslint/ban-types
  } = {},
  P extends readonly RenderPipelineLayout[] = readonly RenderPipelineLayout[],
> extends ShaderBuilder<P, E> {
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
    V extends readonly VertexBufferLayout2[] | readonly [],
    O extends [properties: string, type: wgslType] | Struct,
    RP extends readonly RenderPipelineLayout[],
  >(
    this: ShaderBuilder<RP, E>,
    entryPoint: P extends readonly LayoutEntries<F>[] ? S : never,
    shaderFunction: VertexShaderFunction<F, V, O>,
  ) {
    const newBuilder = new VertexShaderBuilder<
      E & Record<S, typeof shaderFunction>,
      P extends RP ? P : never
      //@ts-expect-error
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
