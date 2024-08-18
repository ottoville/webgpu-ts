import { type BindGroupLayoutEntry, BufLayout } from '../BindgroupLayout.js';
import type { PipelineLayout } from '../pipelineLayots/PipelineLayout.js';
import type { Struct } from '../Struct.js';
import type { FilteredBindgroupEntrys, ShaderFunction } from '../Utilities.js';
import { AbstractShader } from './AbstractShader.js';

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
  readonly pipelineLayouts: P;
};
export interface ShaderParamsConstructor<
  E extends Readonly<{ [index: string]: ShaderFunction }> = Readonly<{
    [index: string]: ShaderFunction;
  }>,
  P extends readonly PipelineLayout[] = readonly PipelineLayout[],
  F extends BindGroupLayoutEntry = BindGroupLayoutEntry,
> extends ShaderParams<E, P> {
  constantCode?:
    | ((
        args: FilteredBindgroupEntrys<P[number]['bindGroupLayouts'], F>,
      ) => string)
    | undefined;
}

export abstract class Shader<
  E extends { [index: string]: ShaderFunction } = {
    [index: string]: ShaderFunction;
  },
  P extends readonly PipelineLayout[] = readonly PipelineLayout[],
> extends AbstractShader<E, P> {
  module: GPUShaderModule;
  wgsl: string;
  readonly props: ShaderParams<E, P>;
  constructor(
    props: ShaderParamsConstructor<E, P>,
    shaderFlag: ShaderStage,
    structs: Set<Struct> = new Set(),
  ) {
    super(props.pipelineLayouts, props.label, props.entryPoints);
    const groups = props.pipelineLayouts[0]!.bindGroupLayouts.reduce(
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

    const entries = props.pipelineLayouts[0]!.bindGroupLayouts.map(
      (bl) => bl.entries,
    );
    if (props.constantCode) {
      //@ts-expect-error todo
      this.wgsl += props.constantCode(entries);
      delete props.constantCode;
    }
    const compilationHints: GPUShaderModuleCompilationHint[] = [];
    for (const key in props.entryPoints) {
      const entryPoint = props.entryPoints[key]!;
      this.wgsl += entryPoint.createCode(entries, key);
      compilationHints.push(
        ...props.pipelineLayouts.map((pipelineLayout) => {
          return {
            entryPoint: key,
            layout: pipelineLayout.layout,
          };
        }),
      );
    }
    const gpu = props.pipelineLayouts[0]!.gpu;
    console.debug('create shader', props.label, this.wgsl);
    this.module = gpu.createShaderModule({
      code: this.wgsl,
      compilationHints,
      label: props.label,
    });
    this.props = Object.freeze(props);
  }
}
