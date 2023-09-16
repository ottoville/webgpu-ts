import type {
  AnyComputeStage,
  ComputeShaderFunction,
} from './shaderFunctions/ComputeShaderFunction.js';
import { FragmentShader } from './shaders/FragmentShader.js';
import {
  AnyFragmentStage,
  FragmentShaderFunction,
} from './shaderFunctions/FragmentShaderFunction.js';
import type { PipelineLayout, RenderPipelineLayout } from './PipelineLayout.js';
import { VertexEntry, VertexShader } from './shaders/VertexShader.js';
import {
  AnyVertexStage,
  VertexShaderFunction,
} from './shaderFunctions/VertexShaderFunction.js';
import { ComputeShader } from './shaders/ComputeShader.js';
import type { FilteredBindgroupEntrys, LayoutEntries } from './Utilities.js';
import type { BindGroupLayoutEntry } from './BindgroupLayout.js';

export class ShaderBuilder<
  // eslint-disable-next-line @typescript-eslint/ban-types
  E extends {},
  const P extends readonly PipelineLayout[],
> {
  entryPoints: E = {} as E;
  constructor(public pipelineLayouts: P) {}
  addFunction<
    S extends string,
    F extends readonly {
      [index: string]: BindGroupLayoutEntry<AnyVertexStage>;
    }[],
    RP extends readonly RenderPipelineLayout[],
  >(
    this: ShaderBuilder<E, RP>,
    entryPoint: P extends readonly LayoutEntries<F>[] ? S : never,
    shaderFunction: VertexShaderFunction<F>,
  ): VertexShaderBuilder<E & Record<S, typeof shaderFunction>, RP>;
  addFunction<
    S extends string,
    F extends readonly {
      [index: string]: BindGroupLayoutEntry<AnyFragmentStage>;
    }[],
    RP extends readonly RenderPipelineLayout[],
  >(
    this: ShaderBuilder<E, RP>,
    entryPoint: P extends readonly LayoutEntries<F>[] ? S : never,
    shaderFunction: FragmentShaderFunction<F>,
  ): FragmentShaderBuilder<E & Record<S, typeof shaderFunction>, RP>;
  addFunction<
    S extends string,
    F extends readonly {
      [index: string]: BindGroupLayoutEntry<AnyComputeStage>;
    }[],
    PL extends readonly PipelineLayout[],
  >(
    this: ShaderBuilder<E, PL>,
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
> extends ShaderBuilder<E, P> {
  constructor(p: P) {
    super(p);
  }
  build(label: string) {
    return new FragmentShader({
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
> extends ShaderBuilder<E, P> {
  constructor(p: P) {
    super(p);
  }
  build(
    label: string,
    constantCode?: (
      args: FilteredBindgroupEntrys<P[number]['bindGroupLayouts'], VertexEntry>,
    ) => string,
  ) {
    return new VertexShader(
      {
        entryPoints: this.entryPoints,
        label,
        pipelineLayouts: this.pipelineLayouts,
      },
      constantCode,
    );
  }
}
export class ComputeShaderBuilder<
  // eslint-disable-next-line @typescript-eslint/ban-types
  E extends {} = {},
  P extends readonly PipelineLayout[] = readonly PipelineLayout[],
> extends ShaderBuilder<E, P> {
  constructor(p: P) {
    super(p);
  }
  build(label: string) {
    return new ComputeShader({
      entryPoints: this.entryPoints,
      label,
      pipelineLayouts: this.pipelineLayouts,
    });
  }
}
