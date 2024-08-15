import type { PipelineLayout } from '../pipelineLayots/PipelineLayout';
import type { ComputeShaderFunction } from '../shaderFunctions/ComputeShaderFunction';
import type { FragmentShaderFunction } from '../shaderFunctions/FragmentShaderFunction';
import type { VertexShaderFunction } from '../shaderFunctions/VertexShaderFunction';

export abstract class ShaderBuilder<
  const P extends readonly PipelineLayout[],
  E extends {
    [index: string]:
      | VertexShaderFunction
      | FragmentShaderFunction
      | ComputeShaderFunction; // eslint-disable-next-line @typescript-eslint/ban-types
  } = {},
> {
  entryPoints: E = {} as E;
  constructor(
    public pipelineLayouts: P,
    public label: string = '',
  ) {}
  get hash() {
    const hash_arr: string[] = [this.label];
    Object.entries(this.entryPoints).forEach(([entrypoint, f]) => {
      hash_arr.push(entrypoint + '_' + f.label);
    });
    this.pipelineLayouts.forEach((p) => {
      hash_arr.push(p.layout.label);
    });
    return hash_arr.sort().join();
  }
}
