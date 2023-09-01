import type { BindGroupLayoutEntry } from '../BindgroupLayout';
import type { ComputeShaderFunction } from '../shaderFunctions/ComputeShaderFunction';
import type { PipelineLayout } from '../PipelineLayout';
import { Shader, type ShaderParams, ShaderStage } from '../Shader';
import type { FilteredBindgroupEntrys } from '../Utilities';

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
  constructor(
    public override props: ShaderParams<E, P>,
    constantCode?: (
      args: FilteredBindgroupEntrys<
        P[number]['bindGroupLayouts'],
        ComputeEntry
      >,
    ) => string,
  ) {
    super(
      props,
      ShaderStage.COMPUTE,
      //@ts-expect-error TODO
      constantCode,
    );
  }
  createComputePipeline(entryPoint: keyof E) {
    return this.props.gpu
      .createComputePipelineAsync({
        compute: {
          entryPoint: entryPoint as string,
          module: this.module,
        },
        label: this.module.label + ' ' + (entryPoint as string),
        layout: this.props.pipelineLayouts[0]!.layout,
      })
      .catch((err: unknown) => {
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
