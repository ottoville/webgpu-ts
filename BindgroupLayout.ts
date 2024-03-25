import type { ShaderStage } from './shaders/Shader';
import type { Struct } from './Struct';
import type { TEXTURE_BINDING_TEXTURE, Texture, TextureSize } from './Texture';
import type { TextureView } from './TextureView';

export type MapToGPUBindGroupEntry<
  T extends { [index: string]: BindGroupLayoutEntry },
> = {
  [K in keyof T]: T[K] extends TextLayout<ShaderStage, TextLayoutArrayFormats> // If texture is array format, then depthOrArrayLayers must be set
    ? TextureView<
        Texture<
          GPUTextureFormat,
          TEXTURE_BINDING_TEXTURE,
          TextureSize & { depthOrArrayLayers: GPUIntegerCoordinate }
        >
      >
    : // Any other texture
      T[K] extends TextLayout<ShaderStage, TextLayoutFormats>
      ?
          | TextureView<Texture<GPUTextureFormat, TEXTURE_BINDING_TEXTURE>>
          | GPUExternalTexture
      : T[K] extends BufLayout
        ? GPUBufferBinding
        : GPUBindingResource;
};

interface BindGroupLayoutEntryProps<V extends ShaderStage = ShaderStage>
  extends Omit<GPUBindGroupLayoutEntry, 'binding' | 'visibility'> {
  visibility: V;
}
export abstract class BindGroupLayoutEntry<
  V extends ShaderStage = ShaderStage,
  F extends string = string,
> {
  // Each shader will set this variableName to right context when creating wgsl
  variableName = '';
  constructor(
    public entry: BindGroupLayoutEntryProps<V>,
    public structName: F,
  ) {}
  toString() {
    return this.variableName;
  }
}
export class BufLayout<
  V extends ShaderStage = ShaderStage,
  S extends Struct = Struct,
> extends BindGroupLayoutEntry<V> {
  constructor(
    public override entry: BindGroupLayoutEntryProps<V> & {
      buffer: GPUBufferBindingLayout & { minBindingSize: GPUSize64 };
    },
    public struct: S,
  ) {
    super(entry, struct.name);
  }
  prop(member: keyof S['properties'] & string) {
    return `${this.variableName}.${member}`;
  }
}

type format = 'f32' | 'i32' | 'u32';
/**
 * https://www.w3.org/TR/WGSL/#storage-texel-formats
 */
type storageFormat =
  | 'rgba8unorm'
  | 'rgba8snorm'
  | 'rgba8uint'
  | 'rgba8sint'
  | 'rgba16uint'
  | 'rgba16sint'
  | 'rgba16float'
  | 'r32uint'
  | 'r32sint'
  | 'r32float'
  | 'rg32uint'
  | 'rg32sint'
  | 'rg32float'
  | 'rgba32uint'
  | 'rgba32sint'
  | 'rgba32float'
  | 'bgra8unorm';

abstract class AbstractTextureLayout<
  V extends ShaderStage = ShaderStage,
  F extends string = string,
> extends BindGroupLayoutEntry<V, F> {
  constructor(
    entry: BindGroupLayoutEntryProps<V> &
      (
        | {
            texture: Omit<
              NonNullable<GPUBindGroupLayoutEntry['texture']>,
              'viewDimension'
            >;
          }
        | {
            storageTexture: Omit<
              NonNullable<GPUBindGroupLayoutEntry['storageTexture']>,
              'viewDimension'
            >;
          }
      ),
    structName: F,
  ) {
    const wsglType = structName.split('<')[0]!;
    const types = ['1d', '2d', '2d_array', 'cube', 'cube_array', '3d'] as const;
    const layoutType = types.find((type) => wsglType.endsWith(type))!;
    if (entry.texture) {
      entry.texture.viewDimension = layoutType!.replace(
        '_',
        '-',
      ) as GPUTextureViewDimension;
    } else if (entry.storageTexture) {
      entry.storageTexture.viewDimension = layoutType!.replace(
        '_',
        '-',
      ) as GPUTextureViewDimension;
    }
    super(entry, structName);
  }
}

export class StorageTextLayout<
  V extends ShaderStage = ShaderStage,
> extends AbstractTextureLayout<V> {
  constructor(
    public override entry: BindGroupLayoutEntryProps<V> & {
      storageTexture: NonNullable<GPUBindGroupLayoutEntry['storageTexture']>;
    },
    structName: // Storage Texture Types https://www.w3.org/TR/WGSL/#texture-storage
    // TODO: allow read-write https://github.com/gpuweb/gpuweb/issues/1772
    | `texture_storage_1d<${storageFormat},write>`
      | `texture_storage_2d<${storageFormat},write>`
      | `texture_storage_2d_array<${storageFormat},write>`
      | `texture_storage_3d<${storageFormat},write>`,
  ) {
    super(entry, structName);
  }
}
type TextLayoutFormats = //sampled texture types https://www.w3.org/TR/WGSL/#sampled-texture-type

    | `texture_2d<${format}>`
    | `texture_3d<${format}>`
    | TextLayoutArrayFormats
    | `texture_cube<${format}>`
    //multisampled texture types https://www.w3.org/TR/WGSL/#multisampled-texture-type
    | `texture_multisampled_2d<${format}>`
    | 'texture_depth_multisampled_2d'
    //External Sampled Texture Types https://www.w3.org/TR/WGSL/#external-texture-type
    | 'texture_external';

type TextLayoutArrayFormats =
  | `texture_2d_array<${format}>`
  | `texture_cube_array<${format}>`;

export class TextLayout<
  V extends ShaderStage,
  F extends TextLayoutFormats,
> extends AbstractTextureLayout<V, F> {
  constructor(
    public override entry: Omit<BindGroupLayoutEntryProps<V>, 'texture'> & {
      texture: Omit<
        NonNullable<GPUBindGroupLayoutEntry['texture']>,
        'viewDimension'
      >;
    },
    structName: F,
  ) {
    super(entry, structName);
  }
}

type SamplerFormats = 'sampler' | 'sampler_comparison';

export class SampLayout<
  V extends ShaderStage,
  F extends SamplerFormats,
> extends BindGroupLayoutEntry<V, F> {
  constructor(
    public override entry: BindGroupLayoutEntryProps<V> & {
      sampler: NonNullable<GPUBindGroupLayoutEntry['sampler']>;
    },
    structName: F,
  ) {
    super(entry, structName);
  }
}

export class BGLayout<
  T extends { [index: string]: BindGroupLayoutEntry } = {
    [index: string]: BindGroupLayoutEntry;
  },
> {
  layout: GPUBindGroupLayout;
  entries: Readonly<T>;
  constructor(
    public gpu: GPUDevice,
    label: string,
    entries: T,
  ) {
    const entriesArr = Object.values(entries);
    this.layout = gpu.createBindGroupLayout({
      entries: entriesArr.map((entry, i) => {
        return {
          ...entry.entry,
          binding: i,
        };
      }),
      label,
    });
    this.entries = entries;
  }
}
