/* eslint-disable no-unused-expressions */
import { BGLayout, BufLayout, TextLayout } from '../BindgroupLayout';
import { ShaderStage } from '../shaders/Shader';
import {
  position_vec2,
  position_vec2f32,
  UI_Input,
  diffuseOutput,
} from '../Struct';
import { position_uv_attrs } from './VertexShaderTypeTest';
import { VertexBufferLayout2 } from '../shaders/VertexShader';
import { textureLoad } from '../std_functions';
import { FragmentShaderFunction } from '../shaderFunctions/FragmentShaderFunction';
import { RenderPipelineLayout } from '../PipelineLayout';
import { VertexShaderFunction } from '../shaderFunctions/VertexShaderFunction';
import { ShaderBuilder } from '../ShaderBuilder';
import { ColorRenderTarget } from '../renderTargets/ColorRenderTarget';
import { TextureUsageEnums } from '../Texture';
import { createRenderPipelineBuilder } from '../renderPipeline/RenderPipelineBuilder';

declare const gpu: GPUDevice;

type BGLayout_UIUniforms_texture2d = BGLayout<{
  uniforms: BufLayout<ShaderStage.VERTEX, typeof position_vec2f32>;
  texture: TextLayout<ShaderStage.FRAGMENT, 'texture_2d<f32>'>;
}>;

type BGLayout_UIUniforms_texture2d_array = BGLayout<{
  uniforms: BufLayout<ShaderStage.VERTEX, typeof position_vec2f32>;
  texture: TextLayout<ShaderStage.FRAGMENT, 'texture_2d_array<f32>'>;
}>;

type BGLayout_secondUniforms = BGLayout<{
  secondUniforms: BufLayout<ShaderStage.VERTEX, typeof position_vec2f32>;
}>;

declare const pipelineLayouts_different_fragment: readonly [
  RenderPipelineLayout<
    readonly [BGLayout_UIUniforms_texture2d, BGLayout_secondUniforms]
  >,
  RenderPipelineLayout<
    readonly [BGLayout_UIUniforms_texture2d_array, BGLayout_secondUniforms]
  >,
];
declare const pipelineLayouts_different_vertex: readonly [
  RenderPipelineLayout<
    readonly [
      BGLayout<{
        uniforms: BufLayout<ShaderStage.VERTEX, typeof position_vec2>;
        texture: TextLayout<ShaderStage.FRAGMENT, 'texture_2d<f32>'>;
      }>,
      BGLayout_secondUniforms,
    ]
  >,
  RenderPipelineLayout<
    readonly [BGLayout_UIUniforms_texture2d, BGLayout_secondUniforms]
  >,
];

declare const pipelineLayouts_missing_texture_2d: readonly [
  RenderPipelineLayout<
    [
      BGLayout<{
        uniforms: BufLayout<ShaderStage.VERTEX, typeof position_vec2f32>;
      }>,
      BGLayout_secondUniforms,
    ]
  >,
  RenderPipelineLayout<
    [BGLayout_UIUniforms_texture2d_array, BGLayout_secondUniforms]
  >,
];

const fragmentshaderfunction = new FragmentShaderFunction<
  readonly [
    {
      texture: TextLayout<ShaderStage.FRAGMENT, 'texture_2d<f32>'>;
    },
    // eslint-disable-next-line @typescript-eslint/ban-types
    {},
  ]
>(
  diffuseOutput,
  UI_Input,
  ([{ texture }]) => /* wgsl */ `
        let fragCoordI=vec2<i32>(floor(v_uv));
        let color:vec4<f32> = ${textureLoad(texture, 'fragCoordI', '0')};
    
        var output:Output;
    
        //output.Color=vec4<f32>(0.5,0.5,0.5,1.0);
        output.Diffuse=color;
        return output;`,
);

declare const buffers: VertexBufferLayout2<typeof position_uv_attrs>;

const vertexshaderfunction = new VertexShaderFunction(
  UI_Input,
  [buffers],
  ([{ uniforms /*texture*/ }], [{ position, uv }]) => /* wgsl */ `
  var output : Output;   
  output.Position = vec4<f32>(${uniforms.prop(
    'translate',
  )} + ${position}, 1.0, 1.0);
  output.v_uv=${uv};
  return output;
`,
) satisfies VertexShaderFunction<
  readonly [
    {
      uniforms: BufLayout<ShaderStage.VERTEX, typeof position_vec2f32>;
    },
    {
      secondUniforms: BufLayout<ShaderStage.VERTEX, typeof position_vec2f32>;
    },
  ],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any
>;
const shaderB = new ShaderBuilder(
  pipelineLayouts_different_fragment,
).addFunction('main', vertexshaderfunction);
//Should be fine
const vertexShader = shaderB.build('label');
const fragmentShader = new ShaderBuilder(pipelineLayouts_different_vertex)
  .addFunction('main', fragmentshaderfunction)
  .build('label');

fragmentShader.props.entryPoints.main.output;
vertexShader.props.entryPoints.main.output;

vertexShader.props.pipelineLayouts;

const colorRenderTargets = [
  new ColorRenderTarget(
    {
      context: {
        format: 'bgra8unorm',
        gpu,
        label: 'label',
        size: { height: 300, width: 300 },
        usages: TextureUsageEnums.RENDER_ATTACHMENT,
      },
    },
    {
      clearValue: {
        a: 1.0,
        b: 0.0,
        g: 1.0,
        r: 0.0,
      },
    },
  ),
];

createRenderPipelineBuilder(vertexShader, fragmentShader).build({
  fragment: {
    entryPoint: 'main',
    targets: colorRenderTargets,
  },
  vertex: {
    entryPoint: 'main',
  },
});
//this should be ok
createRenderPipelineBuilder(vertexShader, fragmentShader).build({
  fragment: {
    entryPoint: 'main',
    targets: colorRenderTargets,
  },
  vertex: {
    entryPoint: 'main',
  },
});

createRenderPipelineBuilder(vertexShader, fragmentShader).build({
  fragment: {
    //@ts-expect-error Entrypoint does not exists
    entryPoint: 'noExists',
    targets: colorRenderTargets,
  },
  vertex: {
    //@ts-expect-error Entrypoint does not exists
    entryPoint: 'noExists',
  },
});

const vertexShader_missing_texture_2d = new ShaderBuilder(
  pipelineLayouts_missing_texture_2d,
)
  .addFunction('main', vertexshaderfunction)
  .build('label');

const renderpipelinebuilder = createRenderPipelineBuilder(
  vertexShader_missing_texture_2d,
  fragmentShader,
);

//@ts-expect-error Vertex and fragment shader does not have common pipelinelayout
renderpipelinebuilder.build({
  fragment: {
    entryPoint: 'main',
    targets: colorRenderTargets,
  },
  vertex: {
    entryPoint: 'main',
  },
});
