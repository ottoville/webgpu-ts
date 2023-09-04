import type { BindGroup } from './BindGroup';
import type { BGLayout } from './BindgroupLayout';
import type { RenderPipeline } from './RenderPipeline';

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
  renderPipeLines: Set<RenderPipeline> = new Set();
  subBindGroups: RenderPipelineLayout[] = [];
  bindGroupLayout: BGLayout;

  constructor(
    props: PipeLineLayoutProps<B>,
    public sharedBindgroup?: BindGroup | undefined,
  ) {
    super(Object.freeze(props));
    this.bindGroupLayout = props.bindGroupLayouts.at(-1)!;
  }
  renderPipelineListeners: Set<() => void> = new Set();
  createSharedLayout<T extends BGLayout>(label: string, layout: T) {
    const p = new RenderPipelineLayout({
      bindGroupLayouts: [...this.bindGroupLayouts, layout] as [...B, T],
      label,
    });
    this.subBindGroups.push(p);
    return p;
  }
  createAppendedLayout<T extends BGLayout>(label: string, layout: T) {
    const p = new RenderPipelineLayout({
      bindGroupLayouts: [...this.bindGroupLayouts, layout] as [...B, T],
      label,
    });
    this.subBindGroups.push(p);
    return p;
  }
  /*
        Bind group is shared with sub-bindgroups
    */
  addChildBindGroupLayout<T extends BindGroup>(
    label: string,
    sharedBindgroup: T,
  ) {
    const p = new RenderPipelineLayout(
      {
        bindGroupLayouts: [
          ...this.bindGroupLayouts,
          sharedBindgroup.layout,
        ] as [...B, T extends BindGroup<infer X> ? X : never],
        label,
      },
      sharedBindgroup,
    );
    this.subBindGroups.push(p);
    return p;
  }
}
