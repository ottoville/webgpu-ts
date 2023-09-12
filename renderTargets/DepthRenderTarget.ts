import type {
  DEPTH_FORMATS,
  RENDER_TARGET_TEXTURE,
  STORAGE_BINDING_TEXTURE,
  Texture2dSize,
  TextureParams,
} from '../Texture.js';
import {
  RenderPassTarget,
  type RenderPassTargetOptions,
} from './RenderpassTarget.js';

export class DepthRenderTarget<
  F extends DEPTH_FORMATS = DEPTH_FORMATS,
  U extends RENDER_TARGET_TEXTURE = RENDER_TARGET_TEXTURE,
> extends RenderPassTarget<F, U> {
  constructor(
    public clearValue: number,
    textureOptions: TextureParams<
      F,
      Exclude<U, STORAGE_BINDING_TEXTURE>,
      Texture2dSize
    >,
    renderTargetOptions: RenderPassTargetOptions,
  ) {
    super(textureOptions, renderTargetOptions);
  }
}
