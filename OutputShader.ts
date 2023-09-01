import type { BindGroupLayoutEntry } from './BindgroupLayout';
import { FragmentShaderFunction } from './shaderFunctions/FragmentShaderFunction';
import { Shader, type ShaderParams, type ShaderStage } from './Shader';
import type { Struct } from './Struct';
import type { VertexShaderFunction } from './shaderFunctions/VertexShaderFunction';
import type { VertexBufferLayout2 } from './shaders/VertexShader';
import { PipelineLayout } from './PipelineLayout';

type outputShaderFunction =
  | VertexShaderFunction<
      readonly { [index: string]: BindGroupLayoutEntry<ShaderStage.VERTEX> }[],
      readonly VertexBufferLayout2[] | readonly []
    >
  | FragmentShaderFunction;

/**
 * Shader that have output, use with vertex and fragment shader.
 */
export abstract class OutputShader<
  E extends Readonly<{ [index: string]: outputShaderFunction }> = Readonly<{
    [index: string]: outputShaderFunction;
  }>,
  P extends readonly PipelineLayout[] = readonly PipelineLayout[],
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
