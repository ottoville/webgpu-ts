import type { BGLayout } from './BindgroupLayout';
import { RenderPipelineBuilder } from './RenderPipelineBuilder';

type PipeLineLayoutProps<B extends readonly BGLayout[]> = {
  label: string;
  bindGroupLayouts: B;
};
export class PipelineLayout<
  B extends readonly BGLayout[] = readonly BGLayout[],
> {
  bindGroupLayouts: B;
  layout: GPUPipelineLayout;
  gpu: GPUDevice;
  constructor({ label, bindGroupLayouts }: PipeLineLayoutProps<B>) {
    if (!bindGroupLayouts[0]) {
      throw new Error('pipelineLayout needs bindgrouplayouts');
    }
    Object.freeze(bindGroupLayouts);
    this.gpu = bindGroupLayouts[0].gpu;
    this.bindGroupLayouts = bindGroupLayouts;
    this.layout = this.gpu.createPipelineLayout({
      bindGroupLayouts: bindGroupLayouts.map((b) => b.layout),
      label,
    });
  }
}

export class RenderPipelineLayout<
  B extends readonly BGLayout[] = readonly BGLayout[],
> extends PipelineLayout<B> {
  renderPipeLines: Set<RenderPipelineBuilder> = new Set();

  constructor(props: PipeLineLayoutProps<B>) {
    super(Object.freeze(props));
  }
  renderPipelineListeners: Set<() => void> = new Set();
}
