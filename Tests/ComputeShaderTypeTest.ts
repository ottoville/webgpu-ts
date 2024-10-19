import { BGLayout, BufLayout } from '../BindgroupLayout';
import { PipelineLayout } from '../pipelineLayots/PipelineLayout';
import { Struct, StructProperty } from '../Struct';
import { ShaderStage } from '../shaders/Shader';
import { ComputeShaderBuilder, ComputeShaderFunction } from '../index';

declare const gpu: GPUDevice;

const Lights = new Struct('Lights', {
  length: new StructProperty('', 'u32'),
  pointers: new StructProperty('', 'array<u32>'),
});
const MeshArray = new Struct(
  'MeshArray',
  {
    mesh: new StructProperty('', 'array<MeshUniforms>'),
  },
  [],
);
const Clusters = new Struct(
  'Clusters',
  {
    bounds: new StructProperty('', 'array<ClusterBounds, 27648>'), //32 * 18 * 48 = total tiles = 27648
    lights: new StructProperty('', 'array<u32, 1741824>'), //27648 * 63 = 1741824`,
    lightsCount: new StructProperty('', 'array<u32, 27648>'),
  },
  [],
);
const ViewUniforms = new Struct('ViewUniforms', {
  modelViewProjectionMatrix: new StructProperty('', 'mat4x4<f32>'),
  view: new StructProperty('', 'mat4x4<f32>'),
  viewPosition: new StructProperty('', 'vec3<f32>'),
});
const UpdateClustersBufferLayout = new BufLayout(
  {
    buffer: {
      hasDynamicOffset: false,
      minBindingSize: 7962624,
      type: 'storage',
    },
    visibility: ShaderStage.COMPUTE,
  },
  Clusters,
);

const bindLayouts = [
  new BGLayout(gpu, 'UpdateViewLayout', {
    directional_lights: new BufLayout(
      {
        buffer: {
          hasDynamicOffset: false,
          minBindingSize: 16,
          type: 'read-only-storage',
        },
        visibility: ShaderStage.COMPUTE,
      },
      Lights,
    ),
    meshes: new BufLayout(
      {
        buffer: {
          hasDynamicOffset: false,
          minBindingSize: 512,
          type: 'read-only-storage',
        },
        visibility: ShaderStage.COMPUTE,
      },

      MeshArray,
    ),
  }),
  new BGLayout(gpu, 'UpdateClustersLayout', {
    clusters: UpdateClustersBufferLayout,
    viewUniforms: new BufLayout(
      {
        buffer: {
          hasDynamicOffset: false,
          minBindingSize: 144,
          type: 'uniform',
        },
        visibility: ShaderStage.COMPUTE,
      },
      ViewUniforms,
    ),
  }),
] as const;

const pipelineLayout = new PipelineLayout({
  bindGroupLayouts: bindLayouts,
  label: 'UpdateViewPipeline',
});
// ShaderBuilder<readonly [RenderPipelineLayout<readonly [BGLayout<{
// ShaderBuilder<readonly [PipelineLayout<      readonly [BGLayout<{

const cfunction = new ComputeShaderFunction<
  readonly [
    (typeof bindLayouts)['0']['entries'],
    (typeof bindLayouts)['1']['entries'],
  ]
>('abc', [1, 1, 1], () => '');

const builder = new ComputeShaderBuilder([pipelineLayout], 'test');

builder.addFunction('main', cfunction);
