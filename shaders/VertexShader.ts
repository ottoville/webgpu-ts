import type { BindGroupLayoutEntry } from '../BindgroupLayout.js';
import { OutputShader } from './OutputShader.js';
import type { RenderPipelineLayout } from '../pipelineLayots/RenderPipelineLayout.js';
import { ShaderStage, type ShaderParamsConstructor } from './Shader.js';
import type { VertexShaderFunction } from '../shaderFunctions/VertexShaderFunction.js';

export type VertexEntry = BindGroupLayoutEntry<
  | ShaderStage.VERTEX
  | ShaderStage.COMPUTE_AND_VERTEX
  | ShaderStage.VERTEX_AND_FRAGMENT
>;

interface VertexAttribute extends GPUVertexAttribute {
  shaderFormat: string;
}

export interface VertexBufferLayout<
  A extends Readonly<{ [index: string]: GPUVertexAttribute }> = Readonly<{
    [index: string]: VertexAttribute;
  }>,
> extends Omit<GPUVertexBufferLayout, 'attributes'> {
  /**
   * An array defining the layout of the vertex attributes within each element.
   */
  attributes: A;
}

export class VertexShader<
  E extends Readonly<{
    [index: string]: VertexShaderFunction;
  }> = Readonly<{
    [index: string]: VertexShaderFunction;
  }>,
  P extends readonly RenderPipelineLayout[] = readonly RenderPipelineLayout[],
> extends OutputShader<E, P> {
  constructor(props: ShaderParamsConstructor<E, P, VertexEntry>) {
    super(props, ShaderStage.VERTEX);
  }
}
