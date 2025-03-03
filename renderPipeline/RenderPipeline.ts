import type { BindGroupRef } from '../BindGroup.js';
import type { BGLayout } from '../BindgroupLayout.js';
import type { Buffer, VERTEX_BUFFER } from '../Buffer.js';
import type { IRenderBundleEncoder } from '../RenderbundleEncoder.js';
export type Drawable<
  L extends readonly BGLayout[] = readonly BGLayout[],
  B extends readonly GPUVertexBufferLayout[] = readonly GPUVertexBufferLayout[],
> = {
  bindGroups: {
    [K in keyof L]: BindGroupRef;
  };
  vertexBuffers: {
    [K in keyof B]: {
      buffer: Buffer<VERTEX_BUFFER>;
      offset?: GPUSize64 | undefined;
      size?: GPUSize64 | undefined;
    };
  };
  render: (renderEncoder: IRenderBundleEncoder | GPURenderPassEncoder) => void;
};

export class RenderPipeline<
  L extends readonly BGLayout[] = readonly BGLayout[],
  B extends readonly GPUVertexBufferLayout[] = readonly GPUVertexBufferLayout[],
> {
  constructor(public readonly pipeline: GPURenderPipeline) {}

  readonly drawables: Drawable<L, B>[] = [];
  readonly onDrawableChange: Set<() => void> = new Set();
  renderBundles: Set<IRenderBundleEncoder> = new Set();
  removeDrawable(drawable: Drawable<L, B>) {
    const index = this.drawables.indexOf(drawable);
    if (index >= 0) {
      this.drawables.splice(index, 1);
      this.onDrawableChange.forEach((cb) => cb());
      this.renderBundles.forEach((rb) => rb.destroy());
    }
  }
  addDrawable(drawable: Drawable<L, B>) {
    this.drawables.push(drawable);
    this.onDrawableChange.forEach((cb) => cb());
  }
}
