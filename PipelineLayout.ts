import type { BindGroup, BindGroupRef } from './BindGroup.js';
import { BGLayout } from './BindgroupLayout.js';
import { RenderBundleEncoder } from './RenderbundleEncoder.js';
import { Renderpass } from './Renderpass.js';
import { RenderPipeline } from './renderPipeline/RenderPipeline.js';
import type { RenderPipelineBuilder } from './renderPipeline/RenderPipelineBuilder.js';

type PipeLineLayoutProps<B extends readonly BGLayout[]> = {
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

export class RenderPipelineLayout<
  B extends readonly BGLayout[] = readonly BGLayout[],
> extends PipelineLayout<B> {
  static override CreateEmptyLayout(
    gpu: GPUDevice,
  ): RenderPipelineLayout<readonly []> {
    return Object.setPrototypeOf(
      {
        renderPipeLines: new Set(),
        sharedBindgroups: [],
        subBindGroups: [],
        ...super.CreateEmptyLayout(gpu),
      },
      RenderPipelineLayout.prototype,
    );
  }
  renderPipeLines: Set<RenderPipelineBuilder> = new Set();
  subBindGroups: RenderPipelineLayout[] = [];
  constructor(
    props: PipeLineLayoutProps<B>,
    public sharedBindgroups: readonly BindGroupRef[] = [],
  ) {
    super(Object.freeze(props));
  }
  #setBindGroups(
    renderEncoder: GPURenderPassEncoder | RenderBundleEncoder,
    bindgroups: readonly BindGroupRef[],
    bindGroupStartIndex: number,
  ) {
    if (renderEncoder instanceof GPURenderPassEncoder) {
      bindgroups.forEach((bindGroup) => {
        renderEncoder.setBindGroup(
          bindGroupStartIndex++,
          bindGroup.bindGroup.bindGroup,
          bindGroup.offsets,
        );
      });
    } else {
      bindgroups.forEach((bindGroup) => {
        renderEncoder.renderBundleEncoder.setBindGroup(
          bindGroupStartIndex++,
          bindGroup.bindGroup.getForRenderBundle(renderEncoder),
          bindGroup.offsets,
        );
      });
    }
  }
  render(
    renderEncoder: GPURenderPassEncoder | RenderBundleEncoder,
    renderpass: Renderpass,
    bindGroupStartIndex = 0,
  ): number {
    const nativeEncoder =
      renderEncoder instanceof GPURenderPassEncoder
        ? renderEncoder
        : renderEncoder.renderBundleEncoder;

    let meshesDrawn = 0;
    this.#setBindGroups(
      renderEncoder,
      this.sharedBindgroups,
      bindGroupStartIndex,
    );
    bindGroupStartIndex += this.sharedBindgroups.length;

    this.renderPipeLines.forEach((renderPipeline) => {
      const variant = renderpass.renderPipelines.get(renderPipeline);
      if (variant instanceof RenderPipeline) {
        var drawables = variant.drawables;
        if (!drawables || drawables.length == 0) {
          console.warn(
            'No drawables has been set for renderpass',
            renderpass.props.label,
            ', wont draw anything',
          );
          return;
        }
        nativeEncoder.setPipeline(variant.pipeline);
        drawables.forEach((drawable) => {
          this.#setBindGroups(
            renderEncoder,
            drawable.bindGroups,
            bindGroupStartIndex,
          );

          drawable.vertexBuffers.forEach((buffer, index) => {
            console.debug(
              'set vertexBuffer index',
              index,
              buffer.buffer.props.label,
            );
            nativeEncoder.setVertexBuffer(
              index,
              renderEncoder instanceof RenderBundleEncoder
                ? buffer.buffer.getVertexBinding(renderEncoder)
                : buffer.buffer.getVertexBinding(),
              buffer.offset,
              buffer.size,
            );
          });
          drawable.render(renderEncoder);
          meshesDrawn++;
        });
      }
    });
    this.subBindGroups.forEach((subBindGroup) => {
      meshesDrawn += subBindGroup.render(
        renderEncoder,
        renderpass,
        bindGroupStartIndex,
      );
    });
    return meshesDrawn;
  }
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
