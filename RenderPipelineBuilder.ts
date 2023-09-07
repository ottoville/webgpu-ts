import type { PipelineIntersection } from './Utilities';
import type { ColorRenderTarget } from './renderTargets/ColorRenderTarget';
import type { FragmentShader } from './shaders/FragmentShader';
import type { VertexShader } from './shaders/VertexShader';

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
    pipelineLayout.layout,
  );
}

export class RenderPipelineBuilder<
  V extends VertexShader = VertexShader,
  F extends FragmentShader = FragmentShader,
> {
  constructor(
    private vertexShader: V,
    private fragmentShader: F,
    private pipelineLayout: GPUPipelineLayout,
  ) {}
  build(
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
    return gpu.createRenderPipelineAsync({
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
  }
}
