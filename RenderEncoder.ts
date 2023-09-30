export class RenderEncoder {
  constructor(public render: (renderEncoder: GPURenderPassEncoder) => void) {}
}
