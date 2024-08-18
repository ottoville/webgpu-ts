/* eslint-disable no-unused-expressions */
/* eslint-disable promise/catch-or-return */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { BGLayout, BufLayout, TextLayout } from '../BindgroupLayout';
import { ShaderStage } from '../shaders/Shader';
import {
  position_vec2,
  position_vec2f32,
  UI_Input,
  diffuseOutput,
  UI_Input2,
} from '../Struct';
import { position_uv_attrs } from './VertexShaderTypeTest';
import { VertexBufferLayout2 } from '../shaders/VertexShader';
import { textureLoad } from '../std_functions';
import { FragmentShaderFunction } from '../shaderFunctions/FragmentShaderFunction';
import { RenderPipelineLayout } from '../pipelineLayots/RenderPipelineLayout';
import {
  VertexShaderFunction,
  WGSLcode,
} from '../shaderFunctions/VertexShaderFunction';
import { ColorRenderTarget } from '../renderTargets/ColorRenderTarget';
import { TextureUsageEnums } from '../Texture';
import { createRenderPipelineBuilder } from '../renderPipeline/RenderPipelineBuilder';
import { Renderpass } from '../Renderpass';
import { VertexShaderBuilder } from '../shaderBuilders/VertexShaderBuilder';
import { FragmentShaderBuilder } from '../shaderBuilders/FragmentShaderBuilder';

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

const fragmentshaderfunction = new FragmentShaderFunction(
  diffuseOutput,
  ([{ texture }]) => /* wgsl */ `
        let fragCoordI=vec2<i32>(floor(v_uv));
        let color:vec4<f32> = ${textureLoad(texture, 'fragCoordI', '0')};
    
        var output:Output;
    
        //output.Color=vec4<f32>(0.5,0.5,0.5,1.0);
        output.Diffuse=color;
        return output;`,
  UI_Input,
) satisfies FragmentShaderFunction<
  readonly [
    {
      texture: TextLayout<ShaderStage.FRAGMENT, 'texture_2d<f32>'>;
    },
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    {},
  ]
>;
const fragmentshaderfunction_no_input = new FragmentShaderFunction(
  diffuseOutput,
  ([{ texture }]) => /* wgsl */ `
        let fragCoordI=vec2<i32>(floor(v_uv));
        let color:vec4<f32> = ${textureLoad(texture, 'fragCoordI', '0')};
    
        var output:Output;
    
        //output.Color=vec4<f32>(0.5,0.5,0.5,1.0);
        output.Diffuse=color;
        return output;`,
) satisfies FragmentShaderFunction<
  readonly [
    {
      texture: TextLayout<ShaderStage.FRAGMENT, 'texture_2d<f32>'>;
    },
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    {},
  ]
>;

const fragmentshaderfunction_different_input = new FragmentShaderFunction(
  diffuseOutput,
  ([{ texture }]) => /* wgsl */ `
        let fragCoordI=vec2<i32>(floor(v_uv));
        let color:vec4<f32> = ${textureLoad(texture, 'fragCoordI', '0')};
    
        var output:Output;
    
        //output.Color=vec4<f32>(0.5,0.5,0.5,1.0);
        output.Diffuse=color;
        return output;`,
  UI_Input2,
) satisfies FragmentShaderFunction<
  readonly [
    {
      texture: TextLayout<ShaderStage.FRAGMENT, 'texture_2d<f32>'>;
    },
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    {},
  ]
>;
declare const buffers: VertexBufferLayout2<typeof position_uv_attrs>;

const vertexshaderfunction = new VertexShaderFunction(
  UI_Input,
  [buffers],
  ([{ uniforms /*texture*/ }], [{ position, uv }]) => WGSLcode/* wgsl */ `
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

const shaderB = new VertexShaderBuilder(
  pipelineLayouts_different_fragment,
  'test',
).addFunction('main', vertexshaderfunction);
//Should be fine

const vertexShader = shaderB.build();
vertexShader.props.entryPoints.main.output;
const fragmentShader = new FragmentShaderBuilder(
  pipelineLayouts_different_vertex,
  'test',
)
  .addFunction('main', fragmentshaderfunction)
  .addFunction('main2', fragmentshaderfunction_different_input)
  .addFunction('main3', fragmentshaderfunction_no_input)
  .build();

vertexShader.props.pipelineLayouts;

const colorRenderTargets = {
  diffuse: new ColorRenderTarget(
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
};

const test = createRenderPipelineBuilder(vertexShader, fragmentShader).build({
  fragment: {
    entryPoint: 'main2',
  } as const,
  renderpass: new Renderpass({ colorRenderTargets, label: 'renderpas' }),
  vertex: {
    entryPoint: 'main',
  } as const,
});
test.then((v) => {
  // @ts-expect-error Vertex and Fragment shader have no common input and output
  v.pipeline;
});
const test_no_input = createRenderPipelineBuilder(
  vertexShader,
  fragmentShader,
).build({
  fragment: {
    entryPoint: 'main3',
  },
  renderpass: new Renderpass({ colorRenderTargets, label: 'renderpas' }),
  vertex: {
    entryPoint: 'main',
  },
});
test_no_input.then((v) => {
  // This sould be okay, fragment function have no inputs.
  v.pipeline;
});
//this should be ok
const test2 = createRenderPipelineBuilder(vertexShader, fragmentShader).build({
  fragment: {
    entryPoint: 'main',
  },
  renderpass: new Renderpass({ colorRenderTargets, label: 'renderpas' }),
  vertex: {
    entryPoint: 'main',
  },
});

test2.then((v) => {
  v.pipeline;
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

const vertexShader_missing_texture_2d = new VertexShaderBuilder(
  pipelineLayouts_missing_texture_2d,
  'test',
)
  .addFunction('main', vertexshaderfunction)
  .build();

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
