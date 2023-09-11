import type { BindGroupLayoutEntry } from '../BindgroupLayout.js';
import { FragmentShaderFunction } from '../shaderFunctions/FragmentShaderFunction.js';
import { Shader, type ShaderParams, type ShaderStage } from './Shader.js';
import type { Struct } from '../Struct.js';
import type { VertexShaderFunction } from '../shaderFunctions/VertexShaderFunction.js';
import type { RenderPipelineLayout } from '../PipelineLayout.js';

type outputShaderFunction = VertexShaderFunction | FragmentShaderFunction;

/**
 * Shader that have output, use with vertex and fragment shader.
 */
export abstract class OutputShader<
  E extends Readonly<{ [index: string]: outputShaderFunction }> = Readonly<{
    [index: string]: outputShaderFunction;
  }>,
  //TODO: use renderpipelinelayout
  P extends readonly RenderPipelineLayout[] = readonly RenderPipelineLayout[],
> extends Shader<E> {
  constructor(
    public override props: ShaderParams<E, P>,
    shaderFlag: ShaderStage,
    constantCode?:
      | ((
          b: Readonly<{
            [index: string]: BindGroupLayoutEntry;
          }>[],
        ) => string)
      | undefined,
  ) {
    const outputs: Set<Struct> = new Set();
    for (const key in props.entryPoints) {
      const entryPoint = props.entryPoints[key]!;
      outputs.add(entryPoint.output);
    }
    super(props, shaderFlag, constantCode, outputs);
  }
}
