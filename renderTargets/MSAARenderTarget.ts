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
  override createColorAttachment() {
    const obj = super.createColorAttachment();
    obj.view = this.renderTarget.view;
    obj.resolveTarget =
      this.resolveTexture.renderTarget instanceof GPUCanvasContext
        ? this.resolveTexture.renderTarget.getCurrentTexture().createView()
        : this.resolveTexture.renderTarget.view;
    obj.storeOp = 'discard';
    return obj;
  }
}
