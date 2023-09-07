import type { PipelineIntersection } from './Utilities';
import type { ColorRenderTarget } from './renderTargets/ColorRenderTarget';
import type { FragmentShader } from './shaders/FragmentShader';
import type { VertexShader } from './shaders/VertexShader';
export class RenderPipelineBuilder<
  V extends VertexShader = VertexShader,
  F extends FragmentShader = FragmentShader,
> {
  pipelineLayout: GPUPipelineLayout;
  constructor(
    private vertexShader: V,
    private fragmentShader: F,
  ) {
    /*
    Get intersection of vertex and fragment pipelinelayouts and
    use first layout from that intersection as layout for renderpipeline
   */
    const [pipelineLayout] = this.vertexShader.props.pipelineLayouts.filter(
      (p) => this.fragmentShader.props.pipelineLayouts.includes(p),
    );
    if (!pipelineLayout) {
      throw new Error('pipelineLayout not found');
    }
    this.pipelineLayout = pipelineLayout.layout;
  }
  build(
    descriptor: PipelineIntersection<
      V['props']['pipelineLayouts'],
      F['props']['pipelineLayouts']
    > extends never
      ? never
      : Omit<GPURenderPipelineDescriptor, 'vertex' | 'fragment' | 'layout'> & {
          vertex: Omit<GPUProgrammableStage, 'module'> & {
            entryPoint: V extends VertexShader<infer E>
              ? keyof E & string
              : never;
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
    const gpu = this.vertexShader.props.gpu;
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
