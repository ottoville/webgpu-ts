import { RenderBundleEncoder } from './RenderbundleEncoder';
import { RENDER_TARGET_FORMAT, RENDER_TARGET_TEXTURE } from './Texture';
import { ColorRenderTarget } from './renderTargets/ColorRenderTarget';

type RenderPassProps<U> = {
  colorRenderTargets: U;
  gpu: GPUDevice;
  label: string;
  sampleCount: 1 | 4;
};
export class Renderpass<
  U extends {
    [index: string]: ColorRenderTarget<
      RENDER_TARGET_FORMAT,
      RENDER_TARGET_TEXTURE
    >;
  } = {
    [index: string]: ColorRenderTarget<
      RENDER_TARGET_FORMAT,
      RENDER_TARGET_TEXTURE
    >;
  },
> {
  readonly bundles: RenderBundleEncoder[] = [];
  readonly colorRenderTargets = {} as U;

  constructor(public props: RenderPassProps<U>) {}
}
