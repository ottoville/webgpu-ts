import type { BindGroup, BindGroupRef } from '../BindGroup.js';
import { RenderBundleEncoder } from '../RenderbundleEncoder.js';
import type { Renderpass } from '../Renderpass.js';
import { RenderPipeline } from '../renderPipeline/RenderPipeline.js';
import type { RenderPipelineBuilder } from '../renderPipeline/RenderPipelineBuilder.js';
import { BGLayout } from '../BindgroupLayout.js';
import { type PipeLineLayoutProps, PipelineLayout } from './PipelineLayout.js';

export class RenderPipelineLayout<
  const B extends readonly BGLayout[] = readonly BGLayout[],
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
  renderPipeLineBuilders: Set<RenderPipelineBuilder> = new Set();
  subBindGroups: RenderPipelineLayout[] = [];
  constructor(
    props: PipeLineLayoutProps<B>,
    public readonly sharedBindgroups: readonly BindGroupRef[] = [],
  ) {
    super(Object.freeze(props));
  }
  // Cant be es6 private because "CreateEmptyLayout" creates object from prototype, which cant see es6 private methods
  private setBindGroups(
    renderEncoder: GPURenderPassEncoder | RenderBundleEncoder,
    bindgroups: readonly BindGroupRef[],
    bindGroupStartIndex: number,
  ) {
    if (renderEncoder instanceof GPURenderPassEncoder) {
      bindgroups.forEach((bindGroup) => {
        console.debug(
          'set bindgroup',
          bindGroupStartIndex,
          bindGroup.bindGroup.bindGroup.label,
        );
        renderEncoder.setBindGroup(
          bindGroupStartIndex++,
          bindGroup.bindGroup.bindGroup,
          bindGroup.offsets,
        );
      });
    } else {
      bindgroups.forEach((bindGroup) => {
        console.debug(
          'set bindgroup',
          bindGroupStartIndex,
          bindGroup.bindGroup.bindGroup.label,
        );
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
    let meshesDrawn = 0;
    console.group('shared bindgroups');
    this.setBindGroups(
      renderEncoder,
      this.sharedBindgroups,
      bindGroupStartIndex,
    );
    console.groupEnd();
    bindGroupStartIndex += this.sharedBindgroups.length;

    this.renderPipeLineBuilders.forEach((renderPipelineBuilder) => {
      const renderPipeline = renderpass.renderPipelines.get(
        renderPipelineBuilder,
      );
      if (renderPipeline instanceof RenderPipeline) {
        var drawables = renderPipeline.drawables;
        if (!drawables || drawables.length == 0) {
          console.warn(
            'No drawables has been in renderpipeline,',
            renderPipeline.pipeline.label,
            'set for renderpass',
            renderpass.props.label,
            ', wont draw anything',
          );
          return;
        }
        let nativeEncoder: GPURenderPassEncoder | GPURenderBundleEncoder;
        if (renderEncoder instanceof GPURenderPassEncoder) {
          nativeEncoder = renderEncoder;
        } else {
          nativeEncoder = renderEncoder.renderBundleEncoder;
          renderPipeline.renderBundles.add(renderEncoder);
        }
        console.debug(
          'set renderpipeline',
          renderPipeline.pipeline.label,
          'drawables: ',
          drawables.length,
        );

        nativeEncoder.setPipeline(renderPipeline.pipeline);
        drawables.forEach((drawable) => {
          console.group('drawable bindgroups');
          this.setBindGroups(
            renderEncoder,
            drawable.bindGroups,
            bindGroupStartIndex,
          );
          console.groupEnd();

          drawable.vertexBuffers.forEach((buffer, index) => {
            console.debug(
              'set vertexBuffer for',
              buffer.buffer.props.label,
              ', index:',
              index,
              ', offset:',
              buffer.offset,
              ', size:',
              buffer.size,
              ', actual buffer size:',
              buffer.buffer.props.size,
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
