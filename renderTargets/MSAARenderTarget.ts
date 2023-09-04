import type {
  RENDER_TARGET_FORMAT,
  RENDER_TARGET_TEXTURE,
  STORAGE_BINDING_TEXTURE,
  Texture2dSize,
  TextureParams,
} from '../Texture.js';
import {
  ColorRenderTarget,
  type ColorRenderTargetParams,
} from './ColorRenderTarget.js';
import {
  RenderPassTarget,
  type RenderPassTargetOptions,
} from './RenderpassTarget.js';

export class MSAARenderTarget<
  F extends RENDER_TARGET_FORMAT = RENDER_TARGET_FORMAT,
  U extends RENDER_TARGET_TEXTURE = RENDER_TARGET_TEXTURE,
> extends ColorRenderTarget<F, U> {
  readonly resolveTexture?: RenderPassTarget<F, U>;
  readonly #resolveView: () => GPUTextureView;
  constructor(
    textureOptions: TextureParams<
      F,
      Exclude<U, STORAGE_BINDING_TEXTURE>,
      Texture2dSize
    >,
    renderTargetOptions: RenderPassTargetOptions,
    options: ColorRenderTargetParams,
  ) {
    super(textureOptions, renderTargetOptions, options);
    if (!renderTargetOptions.context) {
      const resolveTexture = new RenderPassTarget(
        textureOptions,
        renderTargetOptions,
      );
      //const resolveTexture = new RenderTarget(this.format, this.usages, textureOptions.label, this.renderPass, { size: options.size }, undefined, undefined, undefined);
      this.resolveTexture = resolveTexture;
      //  this.#resolveView = resolveView;
      this.#resolveView = () => {
        //TODO: do not call this on every render?
        return resolveTexture.view.view;
      };
    } else {
      this.#resolveView = () => {
        return renderTargetOptions.context!.getCurrentTexture().createView();
      };
    }
  }
  override resize(size: { width: number; height: number }, sampleCount: 1 | 4) {
    super.resize(size, sampleCount);
    this.resolveTexture?.resize(size, 1);
  }
  override createColorAttachment() {
    const obj = super.createColorAttachment();
    obj.view = this.view.view;
    obj.resolveTarget = this.#resolveView();
    obj.storeOp = 'discard';
    return obj;
  }
}
