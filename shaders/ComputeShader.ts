import type { BindGroupLayoutEntry } from '../BindgroupLayout.js';
import type { ComputeShaderFunction } from '../shaderFunctions/ComputeShaderFunction.js';
import type { PipelineLayout } from '../PipelineLayout.js';
import {
  Shader,
  type ShaderParams,
  ShaderStage,
  type ShaderParamsConstructor,
} from './Shader.js';

export type ComputeEntry = BindGroupLayoutEntry<
  | ShaderStage.COMPUTE
  | ShaderStage.COMPUTE_AND_VERTEX
  | ShaderStage.COMPUTE_AND_FRAGMENT
>;

export class ComputeShader<
  E extends Readonly<{
    [index: string]: ComputeShaderFunction<
      readonly { [index: string]: BindGroupLayoutEntry<ShaderStage.COMPUTE> }[]
    >;
  }>,
  //TODO: Compute shader have no reason to have multiple pipelinelayouts, as it is not part of any pipeline
  P extends readonly PipelineLayout[] = readonly PipelineLayout[],
> extends Shader<E> {
  readonly props: ShaderParams<E, P>;
  constructor(props: ShaderParamsConstructor<E, P, ComputeEntry>) {
    super(props as ShaderParams<E>, ShaderStage.COMPUTE);
    this.props = Object.freeze(props);
  }
  createComputePipeline(entryPoint: keyof E) {
    return this.props.pipelineLayouts[0]!.gpu.createComputePipelineAsync({
      compute: {
        entryPoint: entryPoint as string,
        module: this.module,
      },
      label: this.module.label + ' ' + (entryPoint as string),
      layout: this.props.pipelineLayouts[0]!.layout,
    }).catch((err: unknown) => {
      throw new Error(
        'createComputePipelineAsync failed on ' +
          this.module.label +
          ' , wgsl:' +
          this.wgsl,
        {
          cause: err,
        },
      );
    });
  }
}
