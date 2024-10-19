/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { BGLayout, BufLayout, TextLayout } from '../BindgroupLayout';
import { RenderPipelineLayout } from '../pipelineLayots/RenderPipelineLayout';
import { ShaderStage } from '../shaders/Shader';
import { Struct, position_vec2f32, UI_Input, StructProperty } from '../Struct';
import {
  VertexBufferLayouts,
  VertexShaderFunction,
  WGSLcode,
} from '../shaderFunctions/VertexShaderFunction';
import { VertexBufferLayout, VertexShader } from '../shaders/VertexShader';
import { VertexShaderBuilder } from '../shaderBuilders/VertexShaderBuilder';

declare const pipelineLayouts: readonly [
  RenderPipelineLayout<
    readonly [
      BGLayout<{
        uniforms: BufLayout<ShaderStage.VERTEX, typeof position_vec2f32>;
        texture: TextLayout<ShaderStage.FRAGMENT, 'texture_2d<f32>'>;
      }>,
    ]
  >,
  RenderPipelineLayout<
    readonly [
      BGLayout<{
        uniforms: BufLayout<ShaderStage.VERTEX, typeof position_vec2f32>;
        texture: TextLayout<ShaderStage.FRAGMENT, 'texture_2d_array<f32>'>;
      }>,
    ]
  >,
];

declare const pipelineLayouts_missing_uniforms: readonly [
  RenderPipelineLayout<
    [
      BGLayout<{
        texture: TextLayout<ShaderStage.FRAGMENT, 'texture_2d<f32>'>;
      }>,
    ]
  >,
  RenderPipelineLayout<
    [
      BGLayout<{
        texture: TextLayout<ShaderStage.FRAGMENT, 'texture_2d_array<f32>'>;
      }>,
    ]
  >,
];

export const position_uv_attrs = new Struct('PositionAndUV', {
  position: new StructProperty('', 'vec2<f32>'),
  uv: new StructProperty('', 'vec2<f32>'),
});

declare const buffers: VertexBufferLayout<typeof position_uv_attrs>;
declare const gpu: GPUDevice;

const vertexshaderfunction = new VertexShaderFunction(
  UI_Input,
  new VertexBufferLayouts([buffers]),
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
  ],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any
>;

//Should be fine
const builder2 = new VertexShaderBuilder(pipelineLayouts, 'test');
builder2.addFunction('main', vertexshaderfunction).build();

const vertexshaderfunction_no_uniforms = new VertexShaderFunction(
  UI_Input,
  new VertexBufferLayouts([buffers]),
  ([,], [{ position, uv }]) => WGSLcode/* wgsl */ `
  var output : Output;   
  output.Position = vec4<f32>(${position}, 1.0, 1.0);
  output.v_uv=${uv};
  return output;
`,
) satisfies VertexShaderFunction<
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  readonly [{}],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any
>;

new VertexShader({
  entryPoints: {
    //VertexShaderFunction is missing uniforms, skipping bindgroup should be allowed
    main: vertexshaderfunction_no_uniforms,
  },
  label: 'UI.vert',
  pipelineLayouts,
});

const builder = new VertexShaderBuilder(
  pipelineLayouts_missing_uniforms,
  'test',
);
//@ts-expect-error pipelinelayout is missing vertex uniforms bindgroup.
builder.addFunction('main', vertexshaderfunction);

//No buffers
new VertexShaderFunction(
  UI_Input,
  new VertexBufferLayouts([]),
  ([{ uniforms /*texture*/ }]) => WGSLcode/* wgsl */ `
    var output : Output;   
    output.Position = vec4<f32>(${uniforms.prop('translate')};
    return output;
  `,
) satisfies VertexShaderFunction<
  readonly [
    {
      uniforms: BufLayout<ShaderStage.VERTEX, typeof position_vec2f32>;
    },
  ],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any
>;

declare const s: BufLayout<
  ShaderStage.VERTEX,
  Struct<{
    readonly a: StructProperty<'f32'>;
  }>
>;
declare const s1: BufLayout<
  ShaderStage.VERTEX,
  Struct<{
    readonly s1: StructProperty<'f32'>;
  }>
>;
declare const s2: BufLayout<
  ShaderStage.VERTEX,
  Struct<{
    readonly s2: StructProperty<'f32'>;
  }>
>;
type s = BufLayout<
  ShaderStage.VERTEX,
  Struct<{
    readonly a: StructProperty<'f32'>;
  }>
>;
type s1 = BufLayout<
  ShaderStage.FRAGMENT,
  Struct<{
    readonly s1: StructProperty<'f32'>;
  }>
>;
type s2 = BufLayout<
  ShaderStage.FRAGMENT,
  Struct<{
    readonly s2: StructProperty<'f32'>;
  }>
>;

//Exactly same bglayout and pipelinelayout, should be ok
declare const pipelineLayouts4: readonly [
  RenderPipelineLayout<readonly [BGLayout<{ a: s; b: s; c: s }>]>,
];
declare const vertexShaderfunctionTest: VertexShaderFunction<
  readonly [{ a: s; b: s; c: s }]
>;
new VertexShaderBuilder(pipelineLayouts4, 'test').addFunction(
  'main',
  vertexShaderfunctionTest,
);

declare const vertexShaderfunctionTest2: VertexShaderFunction<
  readonly [{ a: s; b: s }]
>;
//Bglayouts is missing one entry from pipelinelayout, should be ok
new VertexShaderBuilder(pipelineLayouts4, 'test').addFunction(
  'main',
  vertexShaderfunctionTest2,
);

declare const vertexShaderfunctionTest3: VertexShaderFunction<
  readonly [{ a: s; b: s; c: s; d: s }]
>;
new VertexShaderBuilder(pipelineLayouts4, 'test').addFunction(
  //@ts-expect-error D is not in pipelinelayout
  'main',
  vertexShaderfunctionTest3,
);

//Two bindgroup. Should be ok
declare const vertexShaderfunctionTest4: VertexShaderFunction<
  readonly [{ a: s; b: s }, { a: s; b: s }]
>;
declare const pipelineLayouts5: readonly [
  RenderPipelineLayout<
    [BGLayout<{ a: s; b: s; c: s }>, BGLayout<{ a: s; b: s; c: s }>]
  >,
];
const shaderBuilder2 = new VertexShaderBuilder(pipelineLayouts5, 'test');
//This should be vertexshaderbuilder
shaderBuilder2.addFunction('main', vertexShaderfunctionTest4);

new VertexShaderBuilder(pipelineLayouts4, 'test').addFunction(
  //@ts-expect-error Pipelinelayout is missing second group
  'main',
  vertexShaderfunctionTest4,
);

//Pipelinelayouts Fragment bindings dont interfere
declare const pipelineLayouts6: readonly [
  RenderPipelineLayout<readonly [BGLayout<{ a: s; b: s; c: s1 }>]>,
  RenderPipelineLayout<readonly [BGLayout<{ a: s; b: s; c: s2 }>]>,
];
declare const vertexShaderfunctionTestS1: VertexShaderFunction<
  readonly [{ a: s; b: s }]
>;
new VertexShaderBuilder(pipelineLayouts6, 'test').addFunction(
  'main',
  vertexShaderfunctionTestS1,
);

//Two different functions
const builder0 = new VertexShaderBuilder(pipelineLayouts4, 'test');
const shaderBuilderWithTwoEntries = builder0
  .addFunction('main', vertexShaderfunctionTest2)
  .addFunction('other', vertexShaderfunctionTest);

shaderBuilderWithTwoEntries.entryPoints.main.vertexBufferLayouts.buffers;
shaderBuilderWithTwoEntries.entryPoints.other.vertexBufferLayouts.buffers;

//@ts-expect-error No such entrypoint
shaderBuilderWithTwoEntries.entryPoints.noexists;
new VertexShaderBuilder(pipelineLayouts4, 'test')
  //@ts-expect-error D is missing from pipelinelayout
  .addFunction('main', vertexShaderfunctionTest3)
  .addFunction('other', vertexShaderfunctionTest);
