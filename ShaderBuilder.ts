import { ComputeShaderFunction } from './shaderFunctions/ComputeShaderFunction';
import { FragmentShader } from './shaders/FragmentShader';
import type { FragmentShaderFunction } from './shaderFunctions/FragmentShaderFunction';
import type { PipelineLayout } from './PipelineLayout';
import { VertexBufferLayout2, VertexShader } from './shaders/VertexShader';
import type {
  AnyVertexStage,
  VertexShaderFunction,
} from './shaderFunctions/VertexShaderFunction';
import { BindGroupLayoutEntry } from './BindgroupLayout';
import { ComputeShader } from './shaders/ComputeShader';
import type { ShaderFunction } from './Utilities';

abstract class ShaderBuilder<
  E extends { [index: string]: ShaderFunction },
  P extends readonly PipelineLayout[],
> {
  entryPoints: E = {} as E;
  constructor(public pipelineLayouts: P) {}
}
export class FragmentShaderBuilder<
  E extends { [index: string]: FragmentShaderFunction },
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
}
export class VertexShaderBuilder<
  E extends {
    [index: string]: VertexShaderFunction<
      readonly {
        [index: string]: BindGroupLayoutEntry<AnyVertexStage>;
      }[],
      readonly VertexBufferLayout2[] | readonly []
    >;
  },
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
}
export class ComputeShaderBuilder<
  E extends { [index: string]: ComputeShaderFunction },
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
}
