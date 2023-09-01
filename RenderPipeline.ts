import { PipelineLayout } from './PipelineLayout';
import { ColorRenderTarget } from './renderTargets/ColorRenderTarget';
import { FragmentShader } from './shaders/FragmentShader';
import { VertexShader } from './shaders/VertexShader';

type RenderPipelineProps<V extends VertexShader, F extends FragmentShader> = {
  colorRenderTargets: {
    [index: string]: ColorRenderTarget;
  };
  vertexShader: V;
  vertexEntry: V extends VertexShader<infer E> ? keyof E & string : never;
  fragmentShader: F;
  fragmentEntry: F extends FragmentShader<infer E> ? keyof E & string : never;
};
type Intersection<
  T extends readonly PipelineLayout[],
  U extends readonly PipelineLayout[],
> = {
  [K in keyof T]: T[K] extends U[number] ? T[K] : never;
}[number];
export class RenderPipeline<
  V extends VertexShader = VertexShader,
  F extends FragmentShader = FragmentShader,
> {
  pipeline: Promise<GPURenderPipeline>;
  constructor(private props: RenderPipelineProps<V, F>) {
    const gpu = props.vertexShader.props.gpu;

    /*
    Get intersection of vertex and fragment pipelinelayouts and
    use first layout from that intersection as layout for renderpipeline
   */
    const [pipelineLayout] = new Set([
      ...props.vertexShader.props.pipelineLayouts,
      ...props.fragmentShader.props.pipelineLayouts,
    ]);
    if (!pipelineLayout) {
      throw new Error('pipelineLayout not found');
    }

    this.pipeline = gpu.createRenderPipelineAsync({
      fragment: {
        entryPoint: props.fragmentEntry,
        module: this.props.fragmentShader.module,
        targets: Object.values(this.props.colorRenderTargets).map((rt) => {
          const state: GPUColorTargetState = {
            format: rt.texture.format,
            writeMask: rt.renderTargetOptions.writeMask,
          };
          if (rt.blend) {
            state.blend = rt.blend;
          }
          return state;
        }),
      },
      layout: pipelineLayout.layout,
      vertex: {
        buffers:
          this.props.vertexShader.props.entryPoints[props.vertexEntry]!.buffers,
        entryPoint: props.vertexEntry,
        module: this.props.vertexShader.module,
      },
    });
  }
}

export function createRenderPipeline<
  V extends VertexShader,
  F extends FragmentShader,
>(
  props: RenderPipelineProps<V, F>,
): Intersection<
  V['props']['pipelineLayouts'],
  F['props']['pipelineLayouts']
> extends never
  ? never
  : RenderPipeline<V, F> {
  //@ts-expect-error Typing works regardles of this error
  return new RenderPipeline<V, F>(props);
}
