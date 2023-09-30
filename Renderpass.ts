import { RenderBundleEncoder } from './RenderbundleEncoder';
import { RenderPipeline } from './renderPipeline/RenderPipeline';
import { RenderPipelineBuilder } from './renderPipeline/RenderPipelineBuilder';
import { ColorRenderTarget } from './renderTargets/ColorRenderTarget';

export type RenderpassProps<
  U extends {
    [index: string]: ColorRenderTarget;
  },
> = Readonly<{
  colorRenderTargets: U;
  label: string;
  sampleCount?: 1 | 4;
}>;
export class Renderpass<
  U extends {
    [index: string]: ColorRenderTarget;
  } = {
    [index: string]: ColorRenderTarget;
  },
> {
  readonly renderPipelines: Map<
    RenderPipelineBuilder,
    RenderPipeline | Promise<RenderPipeline>
  > = new Map();
  readonly bundles: RenderBundleEncoder[] = [];
  public readonly props: RenderpassProps<U>;
  constructor(props: RenderpassProps<U>) {
    this.props = Object.freeze(props);
  }
}
