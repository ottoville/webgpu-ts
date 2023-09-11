import type { BindGroupLayoutEntry } from '../BindgroupLayout.js';
import { OutputShader } from './OutputShader.js';
import type { RenderPipelineLayout } from '../PipelineLayout.js';
import { type ShaderParams, ShaderStage } from './Shader.js';
import type { FilteredBindgroupEntrys } from '../Utilities.js';
import type { VertexShaderFunction } from '../shaderFunctions/VertexShaderFunction.js';

export type VertexEntry = BindGroupLayoutEntry<
  | ShaderStage.VERTEX
  | ShaderStage.COMPUTE_AND_VERTEX
  | ShaderStage.VERTEX_AND_FRAGMENT
>;

interface VertexAttribute extends GPUVertexAttribute {
  shaderFormat: string;
}

export interface VertexBufferLayout2<
  A extends Readonly<{ [index: string]: GPUVertexAttribute }> = Readonly<{
    [index: string]: VertexAttribute;
  }>,
> extends Omit<GPUVertexBufferLayout, 'attributes'> {
  /**
   * An array defining the layout of the vertex attributes within each element.
   */
  attributes2: A;
}

export class VertexShader<
  E extends Readonly<{
    [index: string]: VertexShaderFunction;
  }> = Readonly<{
    [index: string]: VertexShaderFunction;
  }>,
  //TODO: use renderpipelinelayout
  P extends readonly RenderPipelineLayout[] = readonly RenderPipelineLayout[],
> extends OutputShader<E, P> {
  constructor(
    props: ShaderParams<E, P>,
    constantCode?: (
      args: FilteredBindgroupEntrys<P[number]['bindGroupLayouts'], VertexEntry>,
    ) => string,
  ) {
    super(
      props,
      ShaderStage.VERTEX,
      //@ts-expect-error TODO
      constantCode,
    );
  }
}
