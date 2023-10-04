/* eslint-disable no-unused-expressions */
import { BGLayout, BufLayout, TextLayout } from '../BindgroupLayout';
import { FragmentShader } from '../shaders/FragmentShader';
import { RenderPipelineLayout } from '../PipelineLayout';
import { ShaderStage } from '../shaders/Shader';
import { ShaderBuilder } from '../ShaderBuilder';
import { position_vec2f32, UI_Input, diffuseOutput } from '../Struct';
import { textureLoad } from '../std_functions';
import { FragmentShaderFunction } from '../shaderFunctions/FragmentShaderFunction';

declare const pipelineLayouts: readonly [
  RenderPipelineLayout<
    [
      BGLayout<{
        uniforms1: BufLayout<ShaderStage.VERTEX, typeof position_vec2f32>;
        texture: TextLayout<ShaderStage.FRAGMENT, 'texture_2d<f32>'>;
      }>,
    ]
  >,
  RenderPipelineLayout<
    [
      BGLayout<{
        uniforms2: BufLayout<ShaderStage.VERTEX, typeof position_vec2f32>;
        texture: TextLayout<ShaderStage.FRAGMENT, 'texture_2d<f32>'>;
      }>,
    ]
  >,
];

declare const pipelineLayouts_missing_texture: readonly [
  RenderPipelineLayout<
    [
      BGLayout<{
        uniforms: BufLayout<ShaderStage.VERTEX, typeof position_vec2f32>;
      }>,
    ]
  >,
];

declare const gpu: GPUDevice;

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
  ]
>;

const fragmentshaderfunction_array = new FragmentShaderFunction(
  diffuseOutput,
  ([{ texture }]) => /* wgsl */ `
        let fragCoordI=vec2<i32>(floor(v_uv));
        let color:vec4<f32> = ${textureLoad(texture, 'fragCoordI', '0', '0')};
    
        var output:Output;
    
        //output.Color=vec4<f32>(0.5,0.5,0.5,1.0);
        output.Diffuse=color;
        return output;`,
  UI_Input,
) satisfies FragmentShaderFunction<
  readonly [
    {
      texture: TextLayout<ShaderStage.FRAGMENT, 'texture_2d_array<f32>'>;
    },
  ]
>;

//Should be fine
const fragmentShaderBuilder = new ShaderBuilder(pipelineLayouts);

fragmentShaderBuilder.addFunction('main', fragmentshaderfunction);

new FragmentShader({
  entryPoints: {
    main: fragmentshaderfunction,
  },
  label: 'UI.vert',
  pipelineLayouts,
});

const vertexshaderfunction_no_texture = new FragmentShaderFunction(
  diffuseOutput,
  () => /* wgsl */ `
      let fragCoordI=vec2<i32>(floor(v_uv));
      let color:vec4<f32> = vec4<f32>(0.5,0.5,0.5,1.0);
      var output:Output;  
      output.Diffuse=color;
      return output;`,
  UI_Input,
) satisfies FragmentShaderFunction<
  // eslint-disable-next-line @typescript-eslint/ban-types
  readonly [{}]
>;

//FragmentShaderFunction is missing texture, should be ok
new ShaderBuilder(pipelineLayouts).addFunction(
  'main',
  vertexshaderfunction_no_texture,
);

new ShaderBuilder(pipelineLayouts_missing_texture).addFunction(
  'main',
  vertexshaderfunction_no_texture,
);

new ShaderBuilder(
  pipelineLayouts_missing_texture,
  //@ts-expect-error pipelinelayout is missing texture bindgroup.
).addFunction2('main', fragmentshaderfunction);

new ShaderBuilder(pipelineLayouts).addFunction(
  //@ts-expect-error Type '"texture_2d<f32>"' is not assignable to type '"texture_2d_array<f32>"'.
  'main',
  fragmentshaderfunction_array,
);

const shaderBuilder = new ShaderBuilder(pipelineLayouts)
  .addFunction('main', fragmentshaderfunction)
  .addFunction('entry_array', vertexshaderfunction_no_texture);

shaderBuilder.entryPoints.main.output;
shaderBuilder.entryPoints.entry_array.output;
//@ts-expect-error entry does not exists
shaderBuilder.entryPoints.noExists.output;

shaderBuilder.build('label');
