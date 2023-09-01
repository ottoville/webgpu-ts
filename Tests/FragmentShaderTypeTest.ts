/* eslint-disable no-unused-expressions */
import { BGLayout, BufLayout, TextLayout } from '../BindgroupLayout';
import { FragmentShader } from '../shaders/FragmentShader';
import { PipelineLayout } from '../PipelineLayout';
import { ShaderStage } from '../Shader';
import { FragmentShaderBuilder } from '../ShaderBuilder';
import { position_vec2f32, UI_Input, diffuseOutput } from '../Struct';
import { textureLoad } from '../std_functions';
import { FragmentShaderFunction } from '../shaderFunctions/FragmentShaderFunction';

declare const pipelineLayouts: readonly [
  PipelineLayout<
    [
      BGLayout<{
        uniforms1: BufLayout<ShaderStage.VERTEX, typeof position_vec2f32>;
        texture: TextLayout<ShaderStage.FRAGMENT, 'texture_2d<f32>'>;
      }>,
    ]
  >,
  PipelineLayout<
    [
      BGLayout<{
        uniforms2: BufLayout<ShaderStage.VERTEX, typeof position_vec2f32>;
        texture: TextLayout<ShaderStage.FRAGMENT, 'texture_2d<f32>'>;
      }>,
    ]
  >,
];

declare const pipelineLayouts_missing_texture: readonly [
  PipelineLayout<
    [
      BGLayout<{
        uniforms: BufLayout<ShaderStage.VERTEX, typeof position_vec2f32>;
      }>,
    ]
  >,
];

declare const gpu: GPUDevice;

const fragmentshaderfunction = new FragmentShaderFunction<
  readonly [
    {
      texture: TextLayout<ShaderStage.FRAGMENT, 'texture_2d<f32>'>;
    },
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

const fragmentshaderfunction_array = new FragmentShaderFunction<
  readonly [
    {
      texture: TextLayout<ShaderStage.FRAGMENT, 'texture_2d_array<f32>'>;
    },
  ]
>(
  diffuseOutput,
  UI_Input,
  ([{ texture }]) => /* wgsl */ `
        let fragCoordI=vec2<i32>(floor(v_uv));
        let color:vec4<f32> = ${textureLoad(texture, 'fragCoordI', '0', '0')};
    
        var output:Output;
    
        //output.Color=vec4<f32>(0.5,0.5,0.5,1.0);
        output.Diffuse=color;
        return output;`,
);

//Should be fine

fragmentshaderfunction.addToShaderBuilder(
  'main',
  new FragmentShaderBuilder(pipelineLayouts),
);

new FragmentShader({
  entryPoints: {
    main: fragmentshaderfunction,
  },
  gpu,
  label: 'UI.vert',
  pipelineLayouts,
});

const vertexshaderfunction_no_texture = new FragmentShaderFunction<
  // eslint-disable-next-line @typescript-eslint/ban-types
  readonly [{}]
>(
  diffuseOutput,
  UI_Input,
  () => /* wgsl */ `
      let fragCoordI=vec2<i32>(floor(v_uv));
      let color:vec4<f32> = vec4<f32>(0.5,0.5,0.5,1.0);
      var output:Output;  
      output.Diffuse=color;
      return output;`,
);

//FragmentShaderFunction is missing texture, should be ok
vertexshaderfunction_no_texture.addToShaderBuilder(
  'main',
  new FragmentShaderBuilder(pipelineLayouts),
);

fragmentshaderfunction.addToShaderBuilder(
  'main',
  //@ts-expect-error pipelinelayout is missing texture bindgroup.
  new FragmentShaderBuilder(pipelineLayouts_missing_texture),
);

fragmentshaderfunction_array.addToShaderBuilder(
  'main',
  //@ts-expect-error Type '"texture_2d<f32>"' is not assignable to type '"texture_2d_array<f32>"'.
  new FragmentShaderBuilder(pipelineLayouts),
);

const shaderBuilder = vertexshaderfunction_no_texture.addToShaderBuilder(
  'entry_array',
  fragmentshaderfunction.addToShaderBuilder(
    'main',
    new FragmentShaderBuilder(pipelineLayouts),
  ),
);

shaderBuilder.entryPoints.main.output;
shaderBuilder.entryPoints.entry_array.output;
//@ts-expect-error entry does not exists
shaderBuilder.entryPoints.noExists.output;

shaderBuilder.build('label', gpu);
