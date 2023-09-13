import type { BindGroup } from '../BindGroup.js';
import type { BGLayout } from '../BindgroupLayout.js';
import type { Buffer, VERTEX_BUFFER } from '../Buffer.js';
import { RenderBundleEncoder } from '../RenderbundleEncoder.js';
export type Drawable<
  L extends readonly BGLayout[] = readonly BGLayout[],
  B extends readonly GPUVertexBufferLayout[] = readonly GPUVertexBufferLayout[],
> = {
  bindGroups: {
    [K in keyof L]: { bindGroup: BindGroup; offsets?: number[] };
  };
  vertexBuffers: {
    [K in keyof B]: {
      buffer: Buffer<VERTEX_BUFFER>;
      offset?: GPUSize64 | undefined;
      size?: GPUSize64 | undefined;
    };
  };
  render: (renderEncoder: RenderBundleEncoder | GPURenderPassEncoder) => void;
};

export class RenderPipeline<
  L extends readonly BGLayout[] = readonly BGLayout[],
  B extends readonly GPUVertexBufferLayout[] = readonly GPUVertexBufferLayout[],
> {
  constructor(public pipeline: GPURenderPipeline) {}

  drawables: Set<Drawable<L, B>> = new Set();
  onDrawableChange: Set<() => void> = new Set();
  addDrawable(drawable: Drawable<L, B>) {
    this.drawables.add(drawable);
    this.onDrawableChange.forEach((cb) => cb());
    return this.drawables;
  }

  draw(
    renderEncoder: RenderBundleEncoder | GPURenderPassEncoder,
    bindGroupStartIndex: number,
  ) {
    const encoder =
      renderEncoder instanceof RenderBundleEncoder
        ? renderEncoder.renderBundleEncoder
        : renderEncoder;
    encoder.setPipeline(this.pipeline);
    if (renderEncoder instanceof RenderBundleEncoder) {
      this.drawables.forEach((drawable) => {
        drawable.bindGroups.forEach((bindGroup, i) => {
          encoder.setBindGroup(
            i + bindGroupStartIndex,
            bindGroup.bindGroup.getForRenderBundle(renderEncoder),
            bindGroup.offsets,
          );
        });
        drawable.vertexBuffers.forEach((vertexBuffer, i) => {
          if (vertexBuffer.buffer) {
            encoder.setVertexBuffer(
              i,
              vertexBuffer.buffer.getVertexBinding(renderEncoder),
              vertexBuffer.offset,
              vertexBuffer.size,
            );
          }
        });
        drawable.render(renderEncoder);
      });
    } else {
      this.drawables.forEach((drawable) => {
        drawable.bindGroups.forEach((bindGroup, i) => {
          encoder.setBindGroup(
            i,
            bindGroup.bindGroup.bindGroup,
            bindGroup.offsets,
          );
        });
        drawable.vertexBuffers.forEach((vertexBuffer, i) => {
          if (vertexBuffer.buffer) {
            encoder.setVertexBuffer(
              i,
              vertexBuffer.buffer.getVertexBinding(),
              vertexBuffer.offset,
              vertexBuffer.size,
            );
          }
        });
        drawable.render(renderEncoder);
      });
    }
    return 0;
  }
}
