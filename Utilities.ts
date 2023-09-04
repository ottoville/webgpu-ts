import type { BGLayout, BindGroupLayoutEntry } from './BindgroupLayout';
import type { PipelineLayout } from './PipelineLayout';
import type { ComputeShaderFunction } from './shaderFunctions/ComputeShaderFunction';
import type { FragmentShaderFunction } from './shaderFunctions/FragmentShaderFunction';
import type { VertexShaderFunction } from './shaderFunctions/VertexShaderFunction';

export type RemoveIndexSignature<T> = {
  [K in keyof T as string extends K
    ? never
    : number extends K
    ? never
    : symbol extends K
    ? never
    : K]: T[K];
};
export type LayoutEntries<
  B extends readonly { [index: string]: BindGroupLayoutEntry }[],
> = PipelineLayout<{ [K in keyof B]: BGLayout<B[K]> }>;

export type FilteredBindgroupEntrys<
  B extends readonly BGLayout[],
  F extends BindGroupLayoutEntry,
> = Readonly<{
  [K in keyof B]: {
    [BE in keyof B[K]['entries']]: B[K]['entries'][BE] extends F
      ? B[K]['entries'][BE]
      : never;
  };
}>;
export type FilteredBindEntrys<
  B extends readonly { [index: string]: BindGroupLayoutEntry }[],
  F extends BindGroupLayoutEntry,
> = Readonly<{
  [K in keyof B]: {
    [BE in keyof B[K]]: B[K][BE] extends F ? B[K][BE] : never;
  };
}>;

export type ShaderFunction =
  | VertexShaderFunction
  | FragmentShaderFunction
  | ComputeShaderFunction;
