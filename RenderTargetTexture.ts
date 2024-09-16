import {
  type RENDER_TARGET_FORMAT,
  type RENDER_TARGET_TEXTURE,
  type Texture,
} from './Texture';
export type RenderTargetTexture<
  U extends RENDER_TARGET_TEXTURE = RENDER_TARGET_TEXTURE,
  VF extends RENDER_TARGET_FORMAT = RENDER_TARGET_FORMAT,
  S extends RenderTargetSize = RenderTargetSize,
> = Texture<U, VF, S>;

export type RenderTargetSize = {
  readonly width: GPUIntegerCoordinate;
  readonly height: GPUIntegerCoordinate;
  readonly depthOrArrayLayers?: GPUIntegerCoordinate;
};
