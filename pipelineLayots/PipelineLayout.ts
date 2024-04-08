import { BGLayout } from '../BindgroupLayout.js';

export type PipeLineLayoutProps<B extends readonly BGLayout[]> = {
  label: string;
  bindGroupLayouts: B;
};
export class PipelineLayout<
  B extends readonly BGLayout[] = readonly BGLayout[],
> {
  static CreateEmptyLayout(gpu: GPUDevice): PipelineLayout<readonly []> {
    return {
      bindGroupLayouts: [],
      gpu,
      layout: gpu.createPipelineLayout({
        bindGroupLayouts: [],
        label: 'Empty pipelinelayout',
      }),
    };
  }
  bindGroupLayouts: B;
  layout: GPUPipelineLayout;
  gpu: GPUDevice;
  constructor({ label, bindGroupLayouts }: PipeLineLayoutProps<B>) {
    if (!bindGroupLayouts[0]) {
      throw new Error('pipelineLayout needs bindgrouplayouts');
    }
    this.gpu = bindGroupLayouts[0].gpu;
    this.bindGroupLayouts = Object.freeze(bindGroupLayouts);
    this.layout = this.gpu.createPipelineLayout({
      bindGroupLayouts: bindGroupLayouts.map((b) => b.layout),
      label,
    });
  }
}
