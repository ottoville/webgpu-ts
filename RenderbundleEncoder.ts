import type { Renderpass } from './Renderpass.js';

export class RenderBundleEncoder {
  #renderBundle: GPURenderBundle | undefined;
  GPURenderBundleEncoderDescriptor: GPURenderBundleEncoderDescriptor;
  renderBundleEncoder: GPURenderBundleEncoder;
  renderBundle() {
    if (!this.#renderBundle) {
      this.record(this);
      this.#renderBundle = this.renderBundleEncoder.finish();
      // Create bundeEncoder ready for next time it is called
      // As writing of this code, resetting renderBundleEncoder is still TODO in webgpu specs.
      this.renderBundleEncoder =
        this.renderPass.props.gpu.createRenderBundleEncoder(
          this.GPURenderBundleEncoderDescriptor,
        );
    }
    return this.#renderBundle;
  }
  destroy() {
    this.#renderBundle = undefined;
  }
  constructor(
    private renderPass: Renderpass,
    renderBundleEncoderDescriptor:
      | Partial<GPURenderBundleEncoderDescriptor>
      | undefined,
    private record: (renderBundleEncoder: RenderBundleEncoder) => void,
  ) {
    this.GPURenderBundleEncoderDescriptor = {
      colorFormats: Object.values(renderPass.props.colorRenderTargets).map(
        (rt) => {
          return rt.renderTargetOptions.context.format;
        },
      ),
      label: renderPass.props.label,
      sampleCount: renderPass.props.sampleCount,
      ...renderBundleEncoderDescriptor,
    };
    console.log(
      'renderbundle formats',
      this.GPURenderBundleEncoderDescriptor.colorFormats,
    );
    this.renderBundleEncoder =
      this.renderPass.props.gpu.createRenderBundleEncoder(
        this.GPURenderBundleEncoderDescriptor,
      );
  }
}
