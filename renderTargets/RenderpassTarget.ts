import { TextureView } from '../TextureView.js';
import {
  type RENDER_TARGET_FORMAT,
  type RENDER_TARGET_TEXTURE,
  type STORAGE_BINDING_TEXTURE,
  Texture,
  type TextureParams,
} from '../Texture.js';
import type { RenderTargetSize } from '../RenderTargetTexture.js';
import type { ColorWriteEnum } from './ColorRenderTarget.js';
import { Renderpass } from '../Renderpass.js';

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
  writeMask?: ColorWriteEnum;
  context: T;
};
export class RenderpassTarget<
  T extends RenderpassTargetOptions = RenderpassTargetOptions,
  C extends
    | GPURenderPassColorAttachment
    | GPURenderPassDepthStencilAttachment =
    | GPURenderPassColorAttachment
    | GPURenderPassDepthStencilAttachment,
> {
  dirty = true;

  public renderTarget: T extends RenderpassTargetOptions<infer TX>
    ? TX extends RenderpassTargetTextureParams<infer XF, infer XU, infer XS>
      ? TextureView<Texture<XU, XF, XS>>
      : GPUCanvasContext
    : never;
  #colorAttachment: Omit<C, 'view'> & { view?: GPUTextureView };
  constructor(
    public renderTargetOptions: T,
    colorAttachment: Omit<C, 'view'>,
  ) {
    this.#colorAttachment = colorAttachment;
    if ('context' in renderTargetOptions.context) {
      //@ts-expect-error rendertarget is GPUCanvasContext
      this.renderTarget = renderTargetOptions.context.context;
    } else {
      const renderTarget = new Texture(renderTargetOptions.context);
      //@ts-expect-error rendertarget is TextureView
      this.renderTarget = new TextureView(
        renderTarget,
        renderTarget.props.format,
        renderTargetOptions.textureViewDescriptor,
      );
    }
  }
  createAttachment(renderpass: Renderpass, getRaw = false): C {
    if (this.dirty) {
      renderpass.bundles.forEach((bundle) => bundle.destroy());
    }
    if (getRaw) {
      this.dirty = false;
      return this.#colorAttachment as C;
    }
    if (this.renderTarget instanceof GPUCanvasContext) {
      this.#colorAttachment.view = this.renderTarget
        .getCurrentTexture()
        .createView({
          label: 'GPUCanvasContext_currenttexture_view',
        });
    } else if (this.dirty) {
      this.#colorAttachment.view = this.renderTarget.getAsRenderTarget(this);
    }
    this.dirty = false;
    return this.#colorAttachment as C;
  }
  resize(size: { width: number; height: number }, sampleCount: 1 | 4 = 1) {
    if (this.renderTarget instanceof TextureView)
      this.renderTarget.texture.resize(size, sampleCount);
  }
}
