import { TextureView } from '../TextureView.js';
import {
  type RENDER_TARGET_FORMAT,
  type RENDER_TARGET_TEXTURE,
  type STORAGE_BINDING_TEXTURE,
  Texture,
  type TextureParams,
} from '../Texture.js';
import type { RenderTargetSize } from '../RenderTargetTexture.js';

export type RenderpassTargetTextureParams<
  F extends RENDER_TARGET_FORMAT = RENDER_TARGET_FORMAT,
  U extends Exclude<RENDER_TARGET_TEXTURE, STORAGE_BINDING_TEXTURE> = Exclude<
    RENDER_TARGET_TEXTURE,
    STORAGE_BINDING_TEXTURE
  >,
  S extends RenderTargetSize = RenderTargetSize,
> = TextureParams<F, U, S>;

export type RenderpassTargetOptions<
  T extends
    | { context: GPUCanvasContext; format: RENDER_TARGET_FORMAT }
    | RenderpassTargetTextureParams =
    | { context: GPUCanvasContext; format: RENDER_TARGET_FORMAT }
    | RenderpassTargetTextureParams,
> = {
  textureViewDescriptor?: GPUTextureViewDescriptor | undefined;
  writeMask: GPUColorWriteFlags;
  context: T;
};
export class RenderpassTarget<T extends RenderpassTargetOptions> {
  public renderTarget: T extends RenderpassTargetOptions<infer TX>
    ? TX extends RenderpassTargetTextureParams<infer XF, infer XU, infer XS>
      ? TextureView<Texture<XF, XU, XS>>
      : GPUCanvasContext
    : never;

  constructor(public renderTargetOptions: T) {
    if ('context' in renderTargetOptions.context) {
      //@ts-expect-error
      this.renderTarget = renderTargetOptions.context.context;
    } else {
      const renderTarget = new Texture(renderTargetOptions.context);
      //@ts-expect-error
      this.renderTarget = new TextureView(
        renderTarget,
        renderTargetOptions.textureViewDescriptor,
      );
    }
  }
  resize(size: { width: number; height: number }, sampleCount: 1 | 4) {
    if (this.renderTarget instanceof TextureView)
      this.renderTarget.texture.resize(size, sampleCount);
  }
}
