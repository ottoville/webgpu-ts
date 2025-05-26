import type { IRenderBundleEncoder } from './RenderbundleEncoder';
import { RenderEncoder } from './RenderEncoder';
import { RenderPipeline } from './renderPipeline/RenderPipeline';
import { RenderPipelineBuilder } from './renderPipeline/RenderPipelineBuilder';
import { ColorRenderTarget } from './renderTargets/ColorRenderTarget';
import { DepthRenderTarget } from './renderTargets/DepthRenderTarget';

export type RenderpassProps<
  U extends {
    [index: string]: ColorRenderTarget;
  },
> = {
  colorRenderTargets: U;
  depthStencilAttachment?: DepthRenderTarget;
  label: string;
  sampleCount?: 1 | 4;
};
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
  readonly bundles: IRenderBundleEncoder[] = [];
  readonly renderEncoders: RenderEncoder[] = [];
  public readonly props: Readonly<RenderpassProps<U>>;
  constructor(props: RenderpassProps<U>) {
    this.props = Object.freeze(props);
  }
  get GPURenderPassDescriptor(): GPURenderPassDescriptor {
    //  TODO: do not re-create on every render
    const renderPassDescriptor: GPURenderPassDescriptor = {
      colorAttachments: Object.values(this.props.colorRenderTargets).map((rt) =>
        rt.createAttachment(this),
      ),
    };
    if (this.props.depthStencilAttachment) {
      renderPassDescriptor.depthStencilAttachment =
        this.props.depthStencilAttachment.createAttachment(this);
    }
    return renderPassDescriptor;
  }
  render(renderEncoder: GPUCommandEncoder) {
    const passEncoder = renderEncoder.beginRenderPass(
      this.GPURenderPassDescriptor,
    );
    if (this.bundles.length) {
      passEncoder.executeBundles(
        this.bundles.map((b) => {
          return b.render();
        }),
      );
    }
    this.renderEncoders.forEach((encoder) => {
      encoder.render(passEncoder);
    });
    passEncoder.end();
  }
}
