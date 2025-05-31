/**
 * Example to draw triangle. Converted from webgpu samples "hellotriangle" example
 * https://github.com/webgpu/webgpu-samples/blob/main/sample/helloTriangle/main.ts
 *
 */

import { VertexShaderBuilder } from '../shaderBuilders/VertexShaderBuilder';
import { RenderPipelineLayout } from '../pipelineLayots/RenderPipelineLayout';
import { BGLayout } from '../BindgroupLayout';
import {
  VertexBufferLayouts,
  VertexBuildin,
  VertexShaderFunction,
  WGSLcode,
} from '../shaderFunctions/VertexShaderFunction';
import { Struct, StructProperty } from '../Struct';
import { createRenderPipelineBuilder } from '../renderPipeline/RenderPipelineBuilder';
import { FragmentShaderBuilder } from '../shaderBuilders/FragmentShaderBuilder';
import { FragmentShaderFunction } from '../shaderFunctions/FragmentShaderFunction';
import { Renderpass } from '../Renderpass';
import { ColorRenderTarget } from '../renderTargets/ColorRenderTarget';

const canvas = document.querySelector('canvas') as HTMLCanvasElement;
const adapter = await navigator.gpu?.requestAdapter({
  featureLevel: 'compatibility',
});
const device = await adapter?.requestDevice();
if (!device) {
  throw new Error('Cant get webgpu device');
}

const context = canvas.getContext('webgpu') as GPUCanvasContext;

const devicePixelRatio = window.devicePixelRatio;
canvas.width = canvas.clientWidth * devicePixelRatio;
canvas.height = canvas.clientHeight * devicePixelRatio;
const presentationFormat = navigator.gpu.getPreferredCanvasFormat();

context.configure({
  device,
  format: presentationFormat,
});
const BindGroupLayout = new BGLayout(device, 'BindGroupLayout', {});
const rootLayout = new RenderPipelineLayout({
  bindGroupLayouts: [BindGroupLayout],
  label: 'rootLayout',
});
export const vertexShaderOutput = new Struct('VOutput', {
  position: new StructProperty('@location(0)', 'vec4<f32>'),
});
const vertexShader = new VertexShaderBuilder(
  [rootLayout],
  'helloTriangleVertex',
)
  .addFunction(
    'main',
    new VertexShaderFunction(
      vertexShaderOutput,
      new VertexBufferLayouts([]),
      () => WGSLcode`
    var pos = array<vec2f, 3>(
    vec2(0.0, 0.5),
    vec2(-0.5, -0.5),
    vec2(0.5, -0.5)
  );

  return vec4f(pos[${VertexBuildin.position}], 0.0, 1.0);`,
    ),
  )
  .build();
export const fragmentShaderOutput = new Struct('VOutput', {});

const fragmentShader = new FragmentShaderBuilder(
  [rootLayout],
  'helloTriangleFragment',
)
  .addFunction(
    'main',
    new FragmentShaderFunction(
      fragmentShaderOutput,
      () => 'return vec4(1.0, 0.0, 0.0, 1.0);',
    ),
  )
  .build();

const renderPass = new Renderpass({
  colorRenderTargets: {
    canvas: new ColorRenderTarget(
      {
        context: {
          context,
          format: 'r8unorm',
        },
      },
      { clearValue: [0, 0, 0, 0] },
    ),
  },
  label: 'renderpass',
});
const renderPipelineBuilder = createRenderPipelineBuilder(
  vertexShader,
  fragmentShader,
);
const renderPipeline = await renderPipelineBuilder.build({
  fragment: {
    entryPoint: 'main',
  },
  label: 'renderpipeline',
  renderpass: renderPass,
  vertex: {
    entryPoint: 'main',
  },
});
function frame() {
  const commandEncoder = device!.createCommandEncoder();
  renderPass.render(commandEncoder);
  device!.queue.submit([commandEncoder.finish()]);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
