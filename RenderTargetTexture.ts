import {
  type RENDER_TARGET_FORMAT,
  type RENDER_TARGET_TEXTURE,
  type Texture,
} from './Texture';
export type RenderTargetTexture<
  F extends RENDER_TARGET_FORMAT = RENDER_TARGET_FORMAT,
  U extends RENDER_TARGET_TEXTURE = RENDER_TARGET_TEXTURE,
  S extends RenderTargetSize = RenderTargetSize,
> = Texture<F, U, S>;

export type RenderTargetSize = {
  readonly width: GPUIntegerCoordinate;
  readonly height: GPUIntegerCoordinate;
  readonly depthOrArrayLayers?: GPUIntegerCoordinate;
};
