import { Renderpass } from '../Renderpass.js';
import {
  ColorRenderTarget,
  type ColorRenderTargetParams,
} from './ColorRenderTarget.js';
import {
  RenderpassTarget,
  RenderpassTargetTextureParams,
  type RenderpassTargetOptions,
} from './RenderpassTarget.js';

export class MSAARenderTarget<
  R extends RenderpassTarget<T>,
  T extends
    RenderpassTargetOptions<RenderpassTargetTextureParams> = RenderpassTargetOptions<RenderpassTargetTextureParams>,
> extends ColorRenderTarget<T> {
  constructor(
    renderTargetOptions: T,
    options: ColorRenderTargetParams,
    public readonly resolveTexture: R,
  ) {
    super(renderTargetOptions, options);
  }
  override resize(size: { width: number; height: number }, sampleCount: 1 | 4) {
    super.resize(size, sampleCount);
    this.resolveTexture?.resize(size, 1);
  }
  override createAttachment(renderpass: Renderpass) {
    const obj = super.createAttachment(renderpass, true);
    obj.view = this.renderTarget.getAsRenderTarget(this);
    obj.resolveTarget =
      this.resolveTexture.renderTarget instanceof GPUCanvasContext
        ? this.resolveTexture.renderTarget.getCurrentTexture().createView()
        : this.resolveTexture.renderTarget.getAsRenderTarget(this);
    obj.storeOp = 'discard';
    return obj;
  }
}
