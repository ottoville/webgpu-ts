import { FragmentShaderFunction } from '../shaderFunctions/FragmentShaderFunction.js';
import {
  Shader,
  type ShaderParamsConstructor,
  type ShaderParams,
  type ShaderStage,
} from './Shader.js';
import { Struct } from '../Struct.js';
import type { VertexShaderFunction } from '../shaderFunctions/VertexShaderFunction.js';
import type { RenderPipelineLayout } from '../PipelineLayout.js';
import type { VertexEntry } from './VertexShader.js';
import type { FragmentEntry } from './FragmentShader.js';

type outputShaderFunction = VertexShaderFunction | FragmentShaderFunction;

/**
 * Shader that have output, use with vertex and fragment shader.
 */
export abstract class OutputShader<
  E extends Readonly<{ [index: string]: outputShaderFunction }> = Readonly<{
    [index: string]: outputShaderFunction;
  }>,
  P extends readonly RenderPipelineLayout[] = readonly RenderPipelineLayout[],
> extends Shader<E> {
  readonly props: ShaderParams<E, P>;
  constructor(
    props:
      | ShaderParamsConstructor<E, P, VertexEntry>
      | ShaderParamsConstructor<E, P, FragmentEntry>,
    shaderFlag: ShaderStage,
  ) {
    const outputStructs: Set<Struct> = new Set();
    for (const key in props.entryPoints) {
      const entryPoint = props.entryPoints[key]!;
      if (entryPoint.output instanceof Struct)
        outputStructs.add(entryPoint.output);
    }
    super(props as ShaderParams<E>, shaderFlag, outputStructs);
    this.props = Object.freeze(props);
  }
}
