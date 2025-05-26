import type { DEPTH_FORMATS } from '../Texture.js';
import {
  RenderpassTarget,
  RenderpassTargetTextureParams,
  type RenderpassTargetOptions,
} from './RenderpassTarget.js';

export class DepthRenderTarget<
  T extends RenderpassTargetOptions<
    RenderpassTargetTextureParams<DEPTH_FORMATS>
  > = RenderpassTargetOptions<RenderpassTargetTextureParams<DEPTH_FORMATS>>,
> extends RenderpassTarget<T, GPURenderPassDepthStencilAttachment> {
  constructor(clearValue: number, renderTargetOptions: T) {
    super(renderTargetOptions, {
      depthClearValue: clearValue,
      depthLoadOp: 'clear',
      depthStoreOp: 'store',
    });
  }
}
