/* eslint-disable no-unused-expressions */
import { BGLayout, BufLayout, TextLayout } from '../BindgroupLayout';
import { PipelineLayout } from '../PipelineLayout';
import { ShaderStage } from '../Shader';
import { VertexShaderBuilder } from '../ShaderBuilder';
import { Struct, position_vec2f32, UI_Input } from '../Struct';
import { VertexShaderFunction } from '../shaderFunctions/VertexShaderFunction';
import { VertexBufferLayout2, VertexShader } from '../shaders/VertexShader';

declare const pipelineLayouts: readonly [
  PipelineLayout<
    readonly [
      BGLayout<{
        uniforms: BufLayout<ShaderStage.VERTEX, typeof position_vec2f32>;
        texture: TextLayout<ShaderStage.FRAGMENT, 'texture_2d<f32>'>;
      }>,
    ]
  >,
  PipelineLayout<
    readonly [
      BGLayout<{
        uniforms: BufLayout<ShaderStage.VERTEX, typeof position_vec2f32>;
        texture: TextLayout<ShaderStage.FRAGMENT, 'texture_2d_array<f32>'>;
      }>,
    ]
  >,
];

declare const pipelineLayouts_missing_uniforms: readonly [
  PipelineLayout<
    [
      BGLayout<{
        texture: TextLayout<ShaderStage.FRAGMENT, 'texture_2d<f32>'>;
      }>,
    ]
  >,
  PipelineLayout<
    [
      BGLayout<{
        texture: TextLayout<ShaderStage.FRAGMENT, 'texture_2d_array<f32>'>;
      }>,
    ]
  >,
];

export const position_uv_attrs = Object.freeze({
  position: {
    format: 'float32x2',
    offset: 0,
    shaderFormat: 'vec2<f32>',
    shaderLocation: 0,
  },
  uv: {
    format: 'float32x2',
    offset: 8,
    shaderFormat: 'vec2<f32>',
    shaderLocation: 1,
  },
} as const);

declare const buffers: VertexBufferLayout2<typeof position_uv_attrs>;
declare const gpu: GPUDevice;

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
  ],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any
>;

//Should be fine
new VertexShader({
  entryPoints: {
    main: vertexshaderfunction,
  },
  gpu,
  label: 'UI.vert',
  pipelineLayouts,
});

const vertexshaderfunction_no_uniforms = new VertexShaderFunction(
  UI_Input,
  [buffers],
  ([,], [{ position, uv }]) => /* wgsl */ `
  var output : Output;   
  output.Position = vec4<f32>(${position}, 1.0, 1.0);
  output.v_uv=${uv};
  return output;
`,
) satisfies VertexShaderFunction<
  // eslint-disable-next-line @typescript-eslint/ban-types
  readonly [{}],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any
>;

new VertexShader({
  entryPoints: {
    //VertexShaderFunction is missing uniforms, skipping bindgroup should be allowed
    main: vertexshaderfunction_no_uniforms,
  },
  gpu,
  label: 'UI.vert',
  pipelineLayouts,
});

vertexshaderfunction.addToShaderBuilder(
  'main',
  //@ts-expect-error pipelinelayout is missing vertex uniforms bindgroup.
  new VertexShaderBuilder(pipelineLayouts_missing_uniforms),
);

//No buffers
new VertexShaderFunction(
  UI_Input,
  [],
  ([{ uniforms /*texture*/ }]) => /* wgsl */ `
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
    readonly a: readonly ['', 'f32'];
  }>
>;
declare const s1: BufLayout<
  ShaderStage.VERTEX,
  Struct<{
    readonly s1: readonly ['', 'f32'];
  }>
>;
declare const s2: BufLayout<
  ShaderStage.VERTEX,
  Struct<{
    readonly s2: readonly ['', 'f32'];
  }>
>;
type s = BufLayout<
  ShaderStage.VERTEX,
  Struct<{
    readonly a: readonly ['', 'f32'];
  }>
>;
type s1 = BufLayout<
  ShaderStage.FRAGMENT,
  Struct<{
    readonly s1: readonly ['', 'f32'];
  }>
>;
type s2 = BufLayout<
  ShaderStage.FRAGMENT,
  Struct<{
    readonly s2: readonly ['', 'f32'];
  }>
>;

//Exactly same bglayout and pipelinelayout, should be ok
declare const pipelineLayouts4: readonly [
  PipelineLayout<readonly [BGLayout<{ a: s; b: s; c: s }>]>,
];
declare const vertexShaderfunctionTest: VertexShaderFunction<
  readonly [{ a: s; b: s; c: s }]
>;
vertexShaderfunctionTest.addToShaderBuilder(
  'main',
  new VertexShaderBuilder(pipelineLayouts4),
);

declare const vertexShaderfunctionTest2: VertexShaderFunction<
  readonly [{ a: s; b: s }]
>;
//Bglayouts is missing one entry from pipelinelayout, should be ok
vertexShaderfunctionTest2.addToShaderBuilder(
  'main',
  new VertexShaderBuilder(pipelineLayouts4),
);

declare const vertexShaderfunctionTest3: VertexShaderFunction<
  readonly [{ a: s; b: s; c: s; d: s }]
>;
//@ts-expect-error D is not in pipelinelayout
vertexShaderfunctionTest3.addToShaderBuilder(
  new VertexShaderBuilder(pipelineLayouts4),
);

//Two bindgroup. Should be ok
declare const vertexShaderfunctionTest4: VertexShaderFunction<
  readonly [{ a: s; b: s }, { a: s; b: s }]
>;
declare const pipelineLayouts5: readonly [
  PipelineLayout<
    [BGLayout<{ a: s; b: s; c: s }>, BGLayout<{ a: s; b: s; c: s }>]
  >,
];
const shaderBuilder2 = new VertexShaderBuilder(pipelineLayouts5);
vertexShaderfunctionTest4.addToShaderBuilder('main', shaderBuilder2);

vertexShaderfunctionTest4.addToShaderBuilder(
  'main',
  //@ts-expect-error Pipelinelayout is missing second group
  new VertexShaderBuilder(pipelineLayouts4),
);

//Pipelinelayouts Fragment bindings dont interfere
declare const pipelineLayouts6: readonly [
  PipelineLayout<readonly [BGLayout<{ a: s; b: s; c: s1 }>]>,
  PipelineLayout<readonly [BGLayout<{ a: s; b: s; c: s2 }>]>,
];
declare const vertexShaderfunctionTestS1: VertexShaderFunction<
  readonly [{ a: s; b: s }]
>;
vertexShaderfunctionTestS1.addToShaderBuilder(
  'main',
  new VertexShaderBuilder(pipelineLayouts6),
);

//Two different functions
const shaderBuilderWithTwoEntries =
  vertexShaderfunctionTest2.addToShaderBuilder(
    'main',
    vertexShaderfunctionTest.addToShaderBuilder(
      'other',
      new VertexShaderBuilder(pipelineLayouts4),
    ),
  );
shaderBuilderWithTwoEntries.entryPoints.main.buffers;
shaderBuilderWithTwoEntries.entryPoints.other.buffers;
//@ts-expect-error No such entrypoint
shaderBuilderWithTwoEntries.entryPoints.noexists.buffers;

vertexShaderfunctionTest3.addToShaderBuilder(
  'main',
  //@ts-expect-error D is missing from pipelinelayout
  vertexShaderfunctionTest.addToShaderBuilder(
    'other',
    new VertexShaderBuilder(pipelineLayouts4),
  ),
);
