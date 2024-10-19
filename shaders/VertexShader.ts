import type { BindGroupLayoutEntry } from '../BindgroupLayout.js';
import { OutputShader } from './OutputShader.js';
import type { RenderPipelineLayout } from '../pipelineLayots/RenderPipelineLayout.js';
import { ShaderStage, type ShaderParamsConstructor } from './Shader.js';
import type { VertexShaderFunction } from '../shaderFunctions/VertexShaderFunction.js';
import { Struct } from '../Struct.js';

export type VertexEntry = BindGroupLayoutEntry<
  | ShaderStage.VERTEX
  | ShaderStage.COMPUTE_AND_VERTEX
  | ShaderStage.VERTEX_AND_FRAGMENT
>;

export interface VertexAttribute extends GPUVertexAttribute {
  shaderFormat: string;
}

export interface VertexBufferLayout<A extends Struct = Struct>
  extends Omit<GPUVertexBufferLayout, 'attributes' | 'arrayStride'> {
  /**
   * An array defining the layout of the vertex attributes within each element.
   */
  struct: A;
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
