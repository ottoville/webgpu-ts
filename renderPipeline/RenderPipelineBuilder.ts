import { BGLayout } from '../BindgroupLayout.js';
import type { RenderPipelineLayout } from '../PipelineLayout.js';
import type { PipelineIntersection } from '../Utilities.js';
import type { ColorRenderTarget } from '../renderTargets/ColorRenderTarget.js';
import type { FragmentShader } from '../shaders/FragmentShader.js';
import type { VertexShader } from '../shaders/VertexShader.js';
import { RenderPipeline } from './RenderPipeline.js';
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

export type RenderPipelineBuilderDesc<
  V extends VertexShader = VertexShader,
  F extends FragmentShader = FragmentShader,
> = Omit<GPURenderPipelineDescriptor, 'vertex' | 'fragment' | 'layout'> & {
  vertex: Omit<GPUProgrammableStage, 'module'> & {
    entryPoint: V extends VertexShader<infer E> ? keyof E & string : never;
  };
} & {
  fragment: Omit<GPUProgrammableStage, 'module' | 'targets'> & {
    entryPoint: F extends FragmentShader<infer E> ? keyof E & string : never;
    targets: (ColorRenderTarget | null)[];
  };
};

export class RenderPipelineBuilder<
  V extends VertexShader = VertexShader,
  F extends FragmentShader = FragmentShader,
  L extends readonly BGLayout[] = readonly BGLayout[],
  B extends readonly GPUVertexBufferLayout[] = readonly GPUVertexBufferLayout[],
> {
  pipelineLayout: GPUPipelineLayout;
  constructor(
    public vertexShader: V,
    public fragmentShader: F,
    renderPipelineLayout: RenderPipelineLayout,
  ) {
    this.pipelineLayout = renderPipelineLayout.layout;
    renderPipelineLayout.renderPipeLines.add(this);
  }
  async build(descriptor: RenderPipelineBuilderDesc<V, F>) {
    const gpu = this.vertexShader.props.pipelineLayouts[0]!.gpu;

    const RenderPipelineDescriptor: GPURenderPipelineDescriptor = {
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
    };
    console.debug('create pipeline', RenderPipelineDescriptor);
    const renderPipeline = await gpu
      .createRenderPipelineAsync(RenderPipelineDescriptor)
      .catch((err: unknown) => {
        if (err instanceof DOMException) {
          if (err.message.includes(this.vertexShader.module.label)) {
            console.error(
              'createRenderPipelineAsync failed, vertex',
              this.vertexShader.module.label,
              'wgsl:',
              this.vertexShader.wgsl,
              {
                cause: err,
              },
            );
          } else if (err.message.includes(this.fragmentShader.module.label)) {
            console.error(
              'createRenderPipelineAsync failed, fragment',
              this.fragmentShader.module.label,
              'wgsl:',
              this.fragmentShader.wgsl,
              {
                cause: err,
              },
            );
          } else {
            console.error(
              'createRenderPipelineAsync failed, vertex',
              this.vertexShader.module.label,
              ' wgsl:',
              this.vertexShader.wgsl,
              'fragment',
              this.fragmentShader.module,
              ' wgsl:',
              this.fragmentShader.wgsl,
              {
                cause: err,
              },
            );
          }
        }
        throw new Error('createRenderPipelineAsync failed', {
          cause: err,
        });
      });
    return new RenderPipeline<L, B>(renderPipeline);
  }
}
