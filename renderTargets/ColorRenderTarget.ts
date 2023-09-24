import {
  RenderpassTarget,
  type RenderpassTargetOptions,
} from './RenderpassTarget.js';

export const enum ColorWriteEnum {
  RED = 0x1,
  GREEN = 0x2,
  BLUE = 0x4,
  ALPHA = 0x8,
  ALL = 0xf,
}

export type ColorRenderTargetParams = {
  clearValue: GPUColor;
  blend?: GPUBlendState;
};

export class ColorRenderTarget<
  T extends RenderpassTargetOptions = RenderpassTargetOptions,
> extends RenderpassTarget<T> {
  #clearValue: GPUColor;
  public blend: GPUBlendState | undefined;
  constructor(renderTargetOptions: T, options: ColorRenderTargetParams) {
    super(renderTargetOptions);
    this.#clearValue = options.clearValue;
    this.blend = options.blend;
  }

  //TODO: Do not re-create on every render?
  createColorAttachment() {
    const obj: GPURenderPassColorAttachment = {
      clearValue: this.#clearValue,
      loadOp: 'clear',
      storeOp: 'store',
      view:
        this.renderTarget instanceof GPUCanvasContext
          ? this.renderTarget.getCurrentTexture().createView()
          : this.renderTarget.view,
    };
    return obj;
  }
}
