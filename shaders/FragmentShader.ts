import type { BindGroupLayoutEntry } from '../BindgroupLayout.js';
import { OutputShader } from './OutputShader.js';
import type { RenderPipelineLayout } from '../PipelineLayout.js';
import { type ShaderParams, ShaderStage } from './Shader.js';
import type { FilteredBindgroupEntrys } from '../Utilities.js';
import type { FragmentShaderFunction } from '../shaderFunctions/FragmentShaderFunction.js';

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
  P extends readonly RenderPipelineLayout[] = readonly RenderPipelineLayout[],
> extends OutputShader<E, P> {
  constructor(
    props: ShaderParams<E, P>,
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
