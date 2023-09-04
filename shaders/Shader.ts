import { type BindGroupLayoutEntry, BufLayout } from '../BindgroupLayout.js';
import type { PipelineLayout } from '../PipelineLayout.js';
import type { Struct } from '../Struct.js';
import type { ShaderFunction } from '../Utilities.js';

export const enum ShaderStage {
  VERTEX = 1,
  FRAGMENT = 2,
  COMPUTE = 4,
  VERTEX_AND_FRAGMENT = 3, //GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
  COMPUTE_AND_FRAGMENT = 6, // GPUShaderStage.COMPUTE | GPUShaderStage.FRAGMENT
  COMPUTE_AND_VERTEX = 5, // GPUShaderStage.COMPUTE | GPUShaderStage.VERTEX
  COMPUTE_AND_VERTEX_AND_FRAGMENT = 7,
}

export type ShaderParams<
  E extends Readonly<{ [index: string]: ShaderFunction }> = Readonly<{
    [index: string]: ShaderFunction;
  }>,
  P extends readonly PipelineLayout[] = readonly PipelineLayout[],
> = {
  entryPoints: E;
  label: string;
  pipelineLayouts: P;
  gpu: GPUDevice;
};

export abstract class Shader<
  E extends { [index: string]: ShaderFunction } = {
    [index: string]: ShaderFunction;
  },
> {
  module: GPUShaderModule;
  wgsl: string;
  constructor(
    public props: ShaderParams<E>,
    shaderFlag: ShaderStage,
    constantCode?:
      | ((
          b: Readonly<{
            [index: string]: BindGroupLayoutEntry;
          }>[],
        ) => string)
      | undefined,
    structs: Set<Struct> = new Set(),
  ) {
    const groups = this.props.pipelineLayouts[0]!.bindGroupLayouts.reduce(
      (groupstring, group, gi) => {
        return Object.entries(group.entries).reduce(
          (acc, [variableName, binding], bi) => {
            if ((binding.entry.visibility & shaderFlag) === 0) {
              return acc;
            }
            const uniqueName = `g${gi}_${variableName}`;
            binding.variableName = uniqueName;
            let qualifiers = '';
            if (binding instanceof BufLayout) {
              if (binding.entry.buffer.type === 'read-only-storage') {
                qualifiers = '<storage, read>';
              } else if (binding.entry.buffer.type === 'storage') {
                qualifiers = '<storage, read_write>';
              } else {
                // If type is omnitted, default type is uniform https://gpuweb.github.io/gpuweb/#dictdef-gpubufferbindinglayout
                qualifiers = '<uniform>';
              }

              if (binding.struct.depedencies) {
                //@ts-expect-error https://github.com/microsoft/TypeScript/issues/28560
                (binding.struct as Struct).depedencies.forEach((depedency) => {
                  structs.add(depedency);
                });
              }
              structs.add(binding.struct);
            }
            return `${acc}@group(${gi}) @binding(${bi}) var${qualifiers} ${uniqueName} : ${binding.structName};\n`;
          },
          groupstring,
        );
      },
      '\n',
    );
    const structString = Array.from(structs).reduce((s, struct) => {
      return `${s}struct ${
        struct.name
      } {\n${struct.getPropertiesAsString()}}\n`;
    }, '');
    //
    this.wgsl = groups + structString;

    const entries = this.props.pipelineLayouts[0]!.bindGroupLayouts.map(
      (bl) => bl.entries,
    );
    if (constantCode) this.wgsl += constantCode(entries);
    const pipelineLayouts: { [index: string]: GPUShaderModuleCompilationHint } =
      {};
    for (const key in props.entryPoints) {
      const entryPoint = props.entryPoints[key]!;
      //@ts-expect-error
      this.wgsl += entryPoint.createCode(entries, key);
      //@ts-expect-error https://github.com/gpuweb/gpuweb/issues/4233
      pipelineLayouts[key] = this.props.pipelineLayouts.map(
        (pipelineLayout) => pipelineLayout.layout,
      );
    }
    this.module = this.props.gpu.createShaderModule({
      code: this.wgsl,
      hints: pipelineLayouts,
      label: this.props.label,
    });
  }
}
