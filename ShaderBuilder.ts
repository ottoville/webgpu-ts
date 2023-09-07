import type {
  AnyComputeStage,
  ComputeShaderFunction,
} from './shaderFunctions/ComputeShaderFunction.js';
import { FragmentShader } from './shaders/FragmentShader.js';
import type {
  AnyFragmentStage,
  FragmentShaderFunction,
} from './shaderFunctions/FragmentShaderFunction.js';
import type { PipelineLayout } from './PipelineLayout.js';
import { VertexShader } from './shaders/VertexShader.js';
import type {
  AnyVertexStage,
  VertexShaderFunction,
} from './shaderFunctions/VertexShaderFunction.js';
import type { BindGroupLayoutEntry } from './BindgroupLayout.js';
import { ComputeShader } from './shaders/ComputeShader.js';
import type { LayoutEntries, ShaderFunction } from './Utilities.js';

abstract class ShaderBuilder<
  E extends { [index: string]: ShaderFunction },
  P extends readonly PipelineLayout[],
> {
  entryPoints: E = {} as E;
  constructor(public pipelineLayouts: P) {}
}

export class FragmentShaderBuilder<
  // eslint-disable-next-line @typescript-eslint/ban-types
  E extends {},
  P extends readonly PipelineLayout[],
> extends ShaderBuilder<E, P> {
  constructor(p: P) {
    super(p);
  }
  build(label: string, gpu: GPUDevice) {
    return new FragmentShader({
      entryPoints: this.entryPoints,
      gpu,
      label,
      pipelineLayouts: this.pipelineLayouts,
    });
  }
  addFunction<
    S extends string,
    F extends readonly {
      [index: string]: BindGroupLayoutEntry<AnyFragmentStage>;
    }[],
  >(
    entryPoint: P extends readonly LayoutEntries<F>[] ? S : never,
    shaderFunction: FragmentShaderFunction<F>,
  ) {
    const newBuilder = new FragmentShaderBuilder<
      E & Record<S, typeof shaderFunction>,
      P
    >(this.pipelineLayouts);
    //@ts-expect-error
    newBuilder.entryPoints = {
      ...this.entryPoints,
      [entryPoint]: shaderFunction,
    };
    return newBuilder;
  }
}
export class VertexShaderBuilder<
  // eslint-disable-next-line @typescript-eslint/ban-types
  E extends {},
  P extends readonly PipelineLayout[],
> extends ShaderBuilder<E, P> {
  constructor(p: P) {
    super(p);
  }
  build(label: string, gpu: GPUDevice) {
    return new VertexShader({
      entryPoints: this.entryPoints,
      gpu,
      label,
      pipelineLayouts: this.pipelineLayouts,
    });
  }
  addFunction<
    S extends string,
    F extends readonly {
      [index: string]: BindGroupLayoutEntry<AnyVertexStage>;
    }[],
  >(
    entryPoint: P extends readonly LayoutEntries<F>[] ? S : never,
    shaderFunction: VertexShaderFunction<F>,
  ) {
    const newBuilder = new VertexShaderBuilder<
      E & Record<S, typeof shaderFunction>,
      P
    >(this.pipelineLayouts);
    //@ts-expect-error
    newBuilder.entryPoints = {
      ...this.entryPoints,
      [entryPoint]: shaderFunction,
    };
    return newBuilder;
  }
}
export class ComputeShaderBuilder<
  // eslint-disable-next-line @typescript-eslint/ban-types
  E extends {},
  P extends readonly PipelineLayout[],
> extends ShaderBuilder<E, P> {
  constructor(p: P) {
    super(p);
  }
  build(label: string, gpu: GPUDevice) {
    return new ComputeShader({
      entryPoints: this.entryPoints,
      gpu,
      label,
      pipelineLayouts: this.pipelineLayouts,
    });
  }
  addFunction<
    S extends string,
    F extends readonly {
      [index: string]: BindGroupLayoutEntry<AnyComputeStage>;
    }[],
  >(
    entryPoint: P extends readonly LayoutEntries<F>[] ? S : never,
    shaderFunction: ComputeShaderFunction<F>,
  ) {
    const newBuilder = new ComputeShaderBuilder<
      E & Record<S, typeof shaderFunction>,
      P
    >(this.pipelineLayouts);
    //@ts-expect-error
    newBuilder.entryPoints = {
      ...this.entryPoints,
      [entryPoint]: shaderFunction,
    };
    return newBuilder;
  }
}
