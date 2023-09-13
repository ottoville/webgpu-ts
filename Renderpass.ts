import { RenderBundleEncoder } from './RenderbundleEncoder';
import { RenderPipeline } from './renderPipeline/RenderPipeline';
import { RenderPipelineBuilder } from './renderPipeline/RenderPipelineBuilder';
import { ColorRenderTarget } from './renderTargets/ColorRenderTarget';

export type RenderpassProps<U> = Readonly<{
  colorRenderTargets: U;
  gpu: GPUDevice;
  label: string;
  sampleCount: 1 | 4;
}>;
export class Renderpass<
  U extends {
    [index: string]: ColorRenderTarget;
  } = {
    [index: string]: ColorRenderTarget;
  },
> {
  readonly renderPipelines: Map<
    Readonly<RenderPipelineBuilder>,
    RenderPipeline | Promise<RenderPipeline>
  > = new Map();
  readonly bundles: RenderBundleEncoder[] = [];
  public readonly props: RenderpassProps<U>;
  constructor(props: RenderpassProps<U>) {
    this.props = Object.freeze(props);
  }
}
