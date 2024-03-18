import type {
  AnyComputeStage,
  ComputeShaderFunction,
} from './shaderFunctions/ComputeShaderFunction.js';
import { FragmentEntry, FragmentShader } from './shaders/FragmentShader.js';
import {
  AnyFragmentStage,
  FragmentShaderFunction,
} from './shaderFunctions/FragmentShaderFunction.js';
import type { PipelineLayout, RenderPipelineLayout } from './PipelineLayout.js';
import {
  VertexBufferLayout2,
  VertexEntry,
  VertexShader,
} from './shaders/VertexShader.js';
import {
  AnyVertexStage,
  VertexShaderFunction,
} from './shaderFunctions/VertexShaderFunction.js';
import { ComputeShader } from './shaders/ComputeShader.js';
import type { FilteredBindgroupEntrys, LayoutEntries } from './Utilities.js';
import type { BindGroupLayoutEntry } from './BindgroupLayout.js';
import { Struct, wgslType } from './Struct.js';

export class ShaderBuilder<
  const P extends readonly PipelineLayout[],
  // eslint-disable-next-line @typescript-eslint/ban-types
  E extends {} = {},
> {
  entryPoints: E = {} as E;
  constructor(public pipelineLayouts: P) {}
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
  ): VertexShaderBuilder<E & Record<S, typeof shaderFunction>, RP>;
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
    this: ShaderBuilder<RP, E>,
    entryPoint: P extends readonly LayoutEntries<F>[] ? S : never,
    shaderFunction: FragmentShaderFunction<F, I>,
  ): FragmentShaderBuilder<E & Record<S, typeof shaderFunction>, RP>;
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
  ): ComputeShaderBuilder<E & Record<S, typeof shaderFunction>, PL>;
  addFunction<
    S extends string,
    F extends
      | VertexShaderFunction
      | FragmentShaderFunction
      | ComputeShaderFunction,
  >(entryPoint: string, shaderFunction: F) {
    let newBuilder:
      | VertexShaderBuilder
      | FragmentShaderBuilder
      | ComputeShaderBuilder;
    if (shaderFunction instanceof VertexShaderFunction) {
      newBuilder = new VertexShaderBuilder<
        E & Record<S, typeof shaderFunction>,
        P extends RenderPipelineLayout[] ? P : never
        //@ts-expect-error
      >(this.pipelineLayouts);
    } else if (shaderFunction instanceof FragmentShaderFunction) {
      newBuilder = new FragmentShaderBuilder<
        E & Record<S, typeof shaderFunction>,
        P extends RenderPipelineLayout[] ? P : never
        //@ts-expect-error
      >(this.pipelineLayouts);
    } else {
      newBuilder = new ComputeShaderBuilder<
        E & Record<S, typeof shaderFunction>,
        P
      >(this.pipelineLayouts);
    }
    newBuilder.entryPoints = {
      ...this.entryPoints,
      [entryPoint]: shaderFunction,
    };
    return newBuilder;
  }
}

export class FragmentShaderBuilder<
  // eslint-disable-next-line @typescript-eslint/ban-types
  E extends {} = {},
  P extends readonly RenderPipelineLayout[] = readonly RenderPipelineLayout[],
> extends ShaderBuilder<P, E> {
  build(
    label: string,
    constantCode?: (
      args: FilteredBindgroupEntrys<
        P[number]['bindGroupLayouts'],
        FragmentEntry
      >,
    ) => string,
  ) {
    return new FragmentShader({
      constantCode,
      entryPoints: this.entryPoints,
      label,
      pipelineLayouts: this.pipelineLayouts,
    });
  }
}
export class VertexShaderBuilder<
  // eslint-disable-next-line @typescript-eslint/ban-types
  E extends {} = {},
  P extends readonly RenderPipelineLayout[] = readonly RenderPipelineLayout[],
> extends ShaderBuilder<P, E> {
  build(
    label: string,
    constantCode?: (
      args: FilteredBindgroupEntrys<P[number]['bindGroupLayouts'], VertexEntry>,
    ) => string,
  ) {
    return new VertexShader({
      constantCode,
      entryPoints: this.entryPoints,
      label,
      pipelineLayouts: this.pipelineLayouts,
    });
  }
}
export class ComputeShaderBuilder<
  // eslint-disable-next-line @typescript-eslint/ban-types
  E extends {} = {},
  P extends readonly PipelineLayout[] = readonly PipelineLayout[],
> extends ShaderBuilder<P, E> {
  build(label: string) {
    return new ComputeShader({
      entryPoints: this.entryPoints,
      label,
      pipelineLayouts: this.pipelineLayouts,
    });
  }
}
