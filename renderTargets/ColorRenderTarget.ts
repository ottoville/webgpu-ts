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
> extends RenderpassTarget<T, GPURenderPassColorAttachment> {
  public blend: GPUBlendState | undefined;

  constructor(renderTargetOptions: T, options: ColorRenderTargetParams) {
    super(renderTargetOptions, {
      clearValue: options.clearValue,
      loadOp: 'clear',
      storeOp: 'store',
    });
    this.blend = options.blend;
  }
}
