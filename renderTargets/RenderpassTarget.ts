import { TextureView } from '../TextureView.js';
import {
  type RENDER_TARGET_FORMAT,
  type RENDER_TARGET_TEXTURE,
  RenderTarget,
  type STORAGE_BINDING_TEXTURE,
  type Texture,
  type Texture2dSize,
  type TextureParams,
  RenderTargetSize,
} from '../Texture.js';

export type RenderPassTargetOptions = {
  textureViewDescriptor?: GPUTextureViewDescriptor | undefined;
  writeMask: GPUColorWriteFlags;
  context: GPUCanvasContext | undefined;
};
export class RenderPassTarget<
  F extends RENDER_TARGET_FORMAT = RENDER_TARGET_FORMAT,
  U extends RENDER_TARGET_TEXTURE = RENDER_TARGET_TEXTURE,
> extends RenderTarget<F, U> {
  public view: TextureView<Texture<F, U, Texture2dSize>>;
  constructor(
    textureOptions: TextureParams<
      F,
      Exclude<U, STORAGE_BINDING_TEXTURE>,
      RenderTargetSize
    >,
    public renderTargetOptions: RenderPassTargetOptions,
  ) {
    super(textureOptions);
    this.view = new TextureView(
      this,
      renderTargetOptions.textureViewDescriptor,
    );
  }
}
