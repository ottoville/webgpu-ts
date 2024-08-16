import { PipelineLayout } from '../pipelineLayots/PipelineLayout';
import { ShaderFunction } from '../Utilities';

export abstract class AbstractShader<
  E extends { [index: string]: ShaderFunction } = {
    [index: string]: ShaderFunction;
  },
  P extends readonly PipelineLayout[] = readonly PipelineLayout[],
> {
  #hash?: string;
  constructor(
    public readonly pipelineLayouts: P,
    public readonly label: string,
    public entryPoints: E = {} as E,
  ) {}
  get hash() {
    if (!this.#hash) {
      const hash_arr: string[] = [this.label];
      Object.entries(this.entryPoints).forEach(([entrypoint, f]) => {
        hash_arr.push(entrypoint + '_' + f.label);
      });
      this.pipelineLayouts.forEach((p) => {
        hash_arr.push(p.layout.label);
      });
      this.#hash = hash_arr.sort().join();
    }
    return this.#hash;
  }
}
