import type { BindGroup } from './BindGroup.js';
import { BGLayout } from './BindgroupLayout.js';
import type { RenderPipelineBuilder } from './renderPipeline/RenderPipelineBuilder.js';
type BindGroupRef = {
  readonly bindGroup: BindGroup;
  readonly offsets?: number[];
};
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
  subBindGroups: RenderPipelineLayout[] = [];
  constructor(
    props: PipeLineLayoutProps<B>,
    public sharedBindgroups: readonly BindGroupRef[] = [],
  ) {
    super(Object.freeze(props));
  }
  renderPipelineListeners: Set<() => void> = new Set();

  /**
   * Appends bindgroups or bindgrouplayouts for a bindgroup layout.
   * @param label
   * @param sharedBindgroups
   * A tuple of bindgroups mixed with layouts. If bindgroup is given, it is binded and
   * shared with all renderpipelines attached to this layout. For layouts, each
   * drawable will bind its own bindgroup.
   * @returns
   */
  appendBinds<
    //Shared bindgroups or layout
    const T extends readonly [BindGroupRef | BGLayout, ...BGLayout[]],
  >(label: string, sharedBindgroups: T) {
    const p = new RenderPipelineLayout(
      {
        bindGroupLayouts: [
          ...this.bindGroupLayouts,
          ...sharedBindgroups.map((bindGroupOrLayout) => {
            if (bindGroupOrLayout instanceof BGLayout) {
              return bindGroupOrLayout;
            } else return bindGroupOrLayout.bindGroup.layout;
          }),
        ] as unknown as [
          ...B,
          ...{
            [K in keyof T]: T[K] extends {
              bindGroup: BindGroup;
            }
              ? T[K]['bindGroup']['layout']
              : T[K] extends BGLayout
              ? T[K]
              : never;
          },
        ],
        label,
      },
      sharedBindgroups.filter(
        (bg): bg is BindGroupRef => !(bg instanceof BGLayout),
      ),
    );
    this.subBindGroups.push(p);
    return p;
  }
}
