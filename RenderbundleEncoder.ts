import type { Renderpass } from './Renderpass.js';

export class RenderBundleEncoder {
  #renderBundle: GPURenderBundle | undefined;
  GPURenderBundleEncoderDescriptor: GPURenderBundleEncoderDescriptor;
  renderBundleEncoder: GPURenderBundleEncoder;
  render() {
    if (!this.#renderBundle) {
      this.record(this);
      this.#renderBundle = this.renderBundleEncoder.finish();
      // Create bundeEncoder ready for next time it is called
      // As writing of this code, resetting renderBundleEncoder is still TODO in webgpu specs.
      this.renderBundleEncoder = this.gpu.createRenderBundleEncoder(
        this.GPURenderBundleEncoderDescriptor,
      );
    }
    return this.#renderBundle;
  }
  destroy() {
    this.#renderBundle = undefined;
  }
  constructor(
    renderPass: Renderpass,
    private gpu: GPUDevice,
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
      sampleCount: renderPass.props.sampleCount ?? 1,
      ...renderBundleEncoderDescriptor,
    };
    this.renderBundleEncoder = this.gpu.createRenderBundleEncoder(
      this.GPURenderBundleEncoderDescriptor,
    );
  }
}
