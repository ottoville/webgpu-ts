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
> extends RenderpassTarget<T> {
  constructor(
    public clearValue: number,
    renderTargetOptions: T,
  ) {
    super(renderTargetOptions);
  }
}
