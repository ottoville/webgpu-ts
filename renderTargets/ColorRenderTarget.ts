import type {
  RENDER_TARGET_FORMAT,
  RENDER_TARGET_TEXTURE,
  RenderTargetSize,
  STORAGE_BINDING_TEXTURE,
  TextureParams,
} from '../Texture.js';
import {
  RenderPassTarget,
  type RenderPassTargetOptions,
} from './RenderpassTarget.js';

export type ColorRenderTargetParams = {
  clearValue: GPUColor;
  blend: GPUBlendState | undefined;
};

export class ColorRenderTarget<
  F extends RENDER_TARGET_FORMAT = RENDER_TARGET_FORMAT,
  U extends RENDER_TARGET_TEXTURE = RENDER_TARGET_TEXTURE,
> extends RenderPassTarget<F, U> {
  #clearValue: GPUColor;
  public blend: GPUBlendState | undefined;
  constructor(
    textureOptions: TextureParams<
      F,
      Exclude<U, STORAGE_BINDING_TEXTURE>,
      RenderTargetSize
    >,
    renderTargetOptions: RenderPassTargetOptions,
    options: ColorRenderTargetParams,
  ) {
    super(textureOptions, renderTargetOptions);
    this.#clearValue = options.clearValue;
    this.blend = options.blend;
  }

  //TODO: Do not re-create on every render?
  createColorAttachment() {
    const obj: GPURenderPassColorAttachment = {
      clearValue: this.#clearValue,
      loadOp: 'clear',
      storeOp: 'store',
      view: this.renderTargetOptions.context
        ? this.renderTargetOptions.context.getCurrentTexture().createView()
        : this.view.view,
    };
    return obj;
  }
}
