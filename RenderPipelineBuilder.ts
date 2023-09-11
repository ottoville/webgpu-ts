import { BindGroup } from './BindGroup.js';
import { BGLayout } from './BindgroupLayout.js';
import { Buffer2, VERTEX_BUFFER } from './Buffer2.js';
import type { RenderPipelineLayout } from './PipelineLayout.js';
import { RenderBundleEncoder } from './RenderbundleEncoder.js';
import type { PipelineIntersection } from './Utilities.js';
import type { ColorRenderTarget } from './renderTargets/ColorRenderTarget.js';
import type { FragmentShader } from './shaders/FragmentShader.js';
import type { VertexShader } from './shaders/VertexShader.js';

export function createRenderPipelineBuilder<
  V extends VertexShader = VertexShader,
  F extends FragmentShader = FragmentShader,
>(
  vertexShader: V,
  fragmentShader: F,
): PipelineIntersection<
  V['props']['pipelineLayouts'],
  F['props']['pipelineLayouts']
> extends never
  ? never
  : RenderPipelineBuilder<V, F> {
  const [pipelineLayout] = vertexShader.props.pipelineLayouts.filter((p) =>
    fragmentShader.props.pipelineLayouts.includes(p),
  );
  if (!pipelineLayout) {
    throw new Error('pipelineLayout not found');
  }
  //@ts-expect-error
  return new RenderPipelineBuilder(
    vertexShader,
    fragmentShader,
    pipelineLayout,
  );
}

export class RenderPipelineBuilder<
  V extends VertexShader = VertexShader,
  F extends FragmentShader = FragmentShader,
  L extends readonly BGLayout[] = readonly BGLayout[],
  B extends readonly GPUVertexBufferLayout[] = readonly GPUVertexBufferLayout[],
> {
  pipelineLayout: GPUPipelineLayout;
  constructor(
    private vertexShader: V,
    private fragmentShader: F,
    renderPipelineLayout: RenderPipelineLayout,
  ) {
    this.pipelineLayout = renderPipelineLayout.layout;
    renderPipelineLayout.renderPipeLines.add(this);
    renderPipelineLayout.renderPipelineListeners.forEach((cb) => cb());
  }
  async build(
    descriptor: Omit<
      GPURenderPipelineDescriptor,
      'vertex' | 'fragment' | 'layout'
    > & {
      vertex: Omit<GPUProgrammableStage, 'module'> & {
        entryPoint: V extends VertexShader<infer E> ? keyof E & string : never;
      };
    } & {
      fragment: Omit<GPUProgrammableStage, 'module' | 'targets'> & {
        entryPoint: F extends FragmentShader<infer E>
          ? keyof E & string
          : never;
        targets: (ColorRenderTarget | null)[];
      };
    },
  ) {
    const gpu = this.vertexShader.props.pipelineLayouts[0]!.gpu;

    const renderPipeline = await gpu.createRenderPipelineAsync({
      ...descriptor,
      fragment: {
        ...descriptor.fragment,
        module: this.fragmentShader.module,
        targets: descriptor.fragment.targets.map((target) => {
          if (target === null) return null;
          const state: GPUColorTargetState = {
            format: target.texture.format,
            writeMask: target.renderTargetOptions.writeMask,
          };
          if (target.blend) state.blend = target.blend;
          return state;
        }),
      },
      layout: this.pipelineLayout,
      vertex: {
        ...descriptor.vertex,
        buffers:
          this.vertexShader.props.entryPoints[descriptor.vertex.entryPoint]!
            .buffers,
        module: this.vertexShader.module,
      },
    });
    return new RenderPipeline<L, B>(renderPipeline);
  }
}

export class RenderPipeline<
  L extends readonly BGLayout[] = readonly BGLayout[],
  B extends readonly GPUVertexBufferLayout[] = readonly GPUVertexBufferLayout[],
> {
  constructor(public pipeline: GPURenderPipeline) {}

  drawables: {
    bindGroups: {
      [K in keyof L]: { bindGroup: BindGroup; offsets?: number[] };
    };
    vertexBuffers: {
      [K in keyof B]: {
        buffer: Buffer2<VERTEX_BUFFER> | null;
        offset?: GPUSize64 | undefined;
        size?: GPUSize64 | undefined;
      };
    };
    render: (renderEncoder: RenderBundleEncoder | GPURenderPassEncoder) => void;
  }[] = [];

  draw(
    renderEncoder: RenderBundleEncoder | GPURenderPassEncoder,
    bindGroupStartIndex: number,
  ) {
    const encoder =
      renderEncoder instanceof RenderBundleEncoder
        ? renderEncoder.renderBundleEncoder
        : renderEncoder;
    encoder.setPipeline(this.pipeline);
    if (renderEncoder instanceof RenderBundleEncoder) {
      this.drawables.forEach((drawable) => {
        drawable.bindGroups.forEach((bindGroup, i) => {
          encoder.setBindGroup(
            i + bindGroupStartIndex,
            bindGroup.bindGroup.getForRenderBundle(renderEncoder),
            bindGroup.offsets,
          );
        });
        drawable.vertexBuffers.forEach((vertexBuffer, i) => {
          if (vertexBuffer.buffer) {
            encoder.setVertexBuffer(
              i,
              vertexBuffer.buffer.getVertexBinding(renderEncoder),
              vertexBuffer.offset,
              vertexBuffer.size,
            );
          }
        });
        drawable.render(renderEncoder);
      });
    } else {
      this.drawables.forEach((drawable) => {
        drawable.bindGroups.forEach((bindGroup, i) => {
          encoder.setBindGroup(
            i,
            bindGroup.bindGroup.bindGroup,
            bindGroup.offsets,
          );
        });
        drawable.vertexBuffers.forEach((vertexBuffer, i) => {
          if (vertexBuffer.buffer) {
            encoder.setVertexBuffer(
              i,
              vertexBuffer.buffer.getVertexBinding(),
              vertexBuffer.offset,
              vertexBuffer.size,
            );
          }
        });
        drawable.render(renderEncoder);
      });
    }
    return 0;
  }
}
