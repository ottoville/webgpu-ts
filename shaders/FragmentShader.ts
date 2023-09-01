import type { BindGroupLayoutEntry } from '../BindgroupLayout';
import { OutputShader } from '../OutputShader';
import type { PipelineLayout } from '../PipelineLayout';
import { type ShaderParams, ShaderStage } from '../Shader';
import type { FilteredBindgroupEntrys } from '../Utilities';
import type { FragmentShaderFunction } from '../shaderFunctions/FragmentShaderFunction';

export type FragmentEntry = BindGroupLayoutEntry<
  | ShaderStage.FRAGMENT
  | ShaderStage.COMPUTE_AND_FRAGMENT
  | ShaderStage.VERTEX_AND_FRAGMENT
>;

export class FragmentShader<
  E extends Readonly<{
    [index: string]: FragmentShaderFunction;
  }> = Readonly<{
    [index: string]: FragmentShaderFunction;
  }>,
  P extends readonly PipelineLayout[] = readonly PipelineLayout[],
> extends OutputShader<E, P> {
  constructor(
    props: ShaderParams<E, P>,
    // Use bindgrouplayot of fist entrypoint to type constantCode bindgrouplayout
    constantCode?: (
      args: FilteredBindgroupEntrys<
        P[number]['bindGroupLayouts'],
        FragmentEntry
      >,
    ) => string,
  ) {
    super(
      props,
      ShaderStage.FRAGMENT,
      //@ts-expect-error TODO
      constantCode,
    );
  }
}
