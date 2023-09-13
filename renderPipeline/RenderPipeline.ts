import type { BindGroupRef } from '../BindGroup.js';
import type { BGLayout } from '../BindgroupLayout.js';
import type { Buffer, VERTEX_BUFFER } from '../Buffer.js';
import { RenderBundleEncoder } from '../RenderbundleEncoder.js';
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
  render: (renderEncoder: RenderBundleEncoder | GPURenderPassEncoder) => void;
};

export class RenderPipeline<
  L extends readonly BGLayout[] = readonly BGLayout[],
  B extends readonly GPUVertexBufferLayout[] = readonly GPUVertexBufferLayout[],
> {
  constructor(public readonly pipeline: GPURenderPipeline) {}

  readonly drawables: Set<Drawable<L, B>> = new Set();
  readonly onDrawableChange: Set<() => void> = new Set();
  addDrawable(drawable: Drawable<L, B>) {
    this.drawables.add(drawable);
    this.onDrawableChange.forEach((cb) => cb());
    return this.drawables;
  }
}
