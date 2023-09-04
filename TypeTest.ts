/* eslint-disable no-unused-expressions */
import { BGLayout, BufLayout, TextLayout } from './BindgroupLayout';
import { RenderPipeline, createRenderPipeline } from './RenderPipeline';
import { ShaderStage } from './shaders/Shader';
import {
  position_vec2,
  position_vec2f32,
  UI_Input,
  diffuseOutput,
} from './Struct';
import { position_uv_attrs } from './Tests/VertexShaderTypeTest';
import { VertexBufferLayout2 } from './shaders/VertexShader';
import { textureLoad } from './std_functions';
import { FragmentShaderFunction } from './shaderFunctions/FragmentShaderFunction';
import { PipelineLayout } from './PipelineLayout';
import { VertexShaderFunction } from './shaderFunctions/VertexShaderFunction';
import { FragmentShaderBuilder, VertexShaderBuilder } from './ShaderBuilder';
import { ColorRenderTarget } from './renderTargets/ColorRenderTarget';
import { TextureUsageEnums } from './Texture';

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
  PipelineLayout<
    readonly [BGLayout_UIUniforms_texture2d, BGLayout_secondUniforms]
  >,
  PipelineLayout<
    readonly [BGLayout_UIUniforms_texture2d_array, BGLayout_secondUniforms]
  >,
];
declare const pipelineLayouts_different_vertex: readonly [
  PipelineLayout<
    readonly [
      BGLayout<{
        uniforms: BufLayout<ShaderStage.VERTEX, typeof position_vec2>;
        texture: TextLayout<ShaderStage.FRAGMENT, 'texture_2d<f32>'>;
      }>,
      BGLayout_secondUniforms,
    ]
  >,
  PipelineLayout<
    readonly [BGLayout_UIUniforms_texture2d, BGLayout_secondUniforms]
  >,
];

declare const pipelineLayouts_missing_texture_2d: readonly [
  PipelineLayout<
    [
      BGLayout<{
        uniforms: BufLayout<ShaderStage.VERTEX, typeof position_vec2f32>;
      }>,
      BGLayout_secondUniforms,
    ]
  >,
  PipelineLayout<
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

const shaderB = vertexshaderfunction.addToShaderBuilder(
  'main',
  new VertexShaderBuilder(pipelineLayouts_different_fragment),
);
//Should be fine
const vertexShader = shaderB.build('label', gpu);
const fragmentShader = fragmentshaderfunction
  .addToShaderBuilder(
    'main',
    new FragmentShaderBuilder(pipelineLayouts_different_vertex),
  )
  .build('label', gpu);

fragmentShader.props.entryPoints.main.output;
vertexShader.props.entryPoints.main.output;

vertexShader.props.pipelineLayouts;

const colorRenderTargets = {
  todo: new ColorRenderTarget(
    {
      format: 'bgra8unorm',
      gpu,
      label: 'label',
      size: { height: 300, width: 300 },
      usages: TextureUsageEnums.RENDER_ATTACHMENT,
    },
    {
      context: undefined,
      writeMask: 0xf,
    },
    {
      blend: undefined,
      clearValue: {
        a: 1.0,
        b: 0.0,
        g: 1.0,
        r: 0.0,
      },
    },
  ),
};

new RenderPipeline({
  colorRenderTargets,
  fragmentEntry: 'main',
  fragmentShader,
  vertexEntry: 'main',
  vertexShader,
});

//this should be ok
createRenderPipeline({
  colorRenderTargets,
  fragmentEntry: 'main',
  fragmentShader,
  vertexEntry: 'main',
  vertexShader,
});

createRenderPipeline({
  colorRenderTargets,
  //@ts-expect-error FragmentEntry does not exists
  fragmentEntry: 'noExits',
  fragmentShader,
  //@ts-expect-error VertexEntry does not exists
  vertexEntry: 'noExits',
  vertexShader,
});
const vertexShader_missing_texture_2d = vertexshaderfunction
  .addToShaderBuilder(
    'main',
    new VertexShaderBuilder(pipelineLayouts_missing_texture_2d),
  )
  .build('label', gpu);

//This will return never
createRenderPipeline({
  colorRenderTargets,
  fragmentEntry: 'main',
  fragmentShader,
  vertexEntry: 'main',
  vertexShader: vertexShader_missing_texture_2d,
});
