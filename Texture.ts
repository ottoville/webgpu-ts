import type {
  RenderTargetSize,
  RenderTargetTexture,
} from './RenderTargetTexture';
import { TextureView } from './TextureView';

export type Texture2dSize = {
  readonly width: GPUIntegerCoordinate;
  readonly height: GPUIntegerCoordinate;
};

export type TextureSize =
  | {
      readonly width: GPUIntegerCoordinate;
    }
  | Texture2dSize
  | RenderTargetSize;

export type TextureParams<
  F extends GPUTextureFormat,
  U extends Exclude<TextureUsageEnums, STORAGE_BINDING_TEXTURE>,
  S extends TextureSize = TextureSize,
> = {
  gpu: GPUDevice;
  format: F;
  usages: U;
  label: string;
  size: S;
  initialSampleCount?: 1 | 4;
};
/**
 * Allowed formats for STORAGE_BINDING see https://www.w3.org/TR/webgpu/#plain-color-formats
 */
type STORAGE_FORMATS =
  | 'rgba8unorm'
  | 'rgba8snorm'
  | 'rgba8uint'
  | 'rgba8sint'
  | /* when bgra8unorm-storage is enanabled "bgra8unorm" |*/ 'rgba16uint'
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
  | 'rgba32float';
/**
 * Alloved formats for RENDER_ATTACHMENT see https://gpuweb.github.io/gpuweb/#plain-color-formats
 */
export type RENDER_TARGET_FORMAT =
  | DEPTH_FORMATS
  | (
      | 'r8unorm'
      | 'r8uint'
      | 'r8sint'
      | 'rg8unorm'
      | 'rg8uint'
      | 'rg8sint'
      | 'rgba8unorm'
      | 'rgba8unorm-srgb'
      | 'rgba8uint'
      | 'rgba8sint'
      | 'bgra8unorm'
      | 'bgra8unorm-srgb'
      | 'r16uint'
      | 'r16sint'
      | 'r16float'
      | 'rg16uint'
      | 'rg16sint'
      | 'rg16float'
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
      | 'rgb10a2unorm'
      /** If "rg11b10ufloat-renderable" is enabled */
      | 'rg11b10ufloat'
    );
/**
 * Depth formats, see https://gpuweb.github.io/gpuweb/#depth-formats
 */
export type DEPTH_FORMATS =
  | 'stencil8'
  | 'depth16unorm'
  | 'depth24plus'
  | 'depth24plus-stencil8'
  | 'depth32float'
  | 'depth32float-stencil8';

export type TextureParamsStorage<
  F extends STORAGE_FORMATS,
  U extends STORAGE_BINDING_TEXTURE,
  S extends TextureSize,
> = {
  gpu: GPUDevice;

  format: F;
  usages: U;
  label: string;
  size: S;
  initialSampleCount?: 1 | 4;
};
let n = 0;

export const enum TextureUsageEnums {
  COPY_DST = 2,
  COPY_SRC = 1,
  STORAGE_BINDING = 8,
  TEXTURE_BINDING = 4,
  RENDER_ATTACHMENT = 16,
  'TEXTURE_BINDING|COPY_DST' = 6,
  'TEXTURE_BINDING|COPY_DST|COPY_SRC' = 7,
  'RENDER_ATTACHMENT|COPY_SRC' = 17,
  'RENDER_ATTACHMENT|TEXTURE_BINDING' = 20,
  'RENDER_ATTACHMENT|TEXTURE_BINDING|COPY_SRC' = 21,
  'RENDER_ATTACHMENT|TEXTURE_BINDING|COPY_DST' = 22,
  'RENDER_ATTACHMENT|TEXTURE_BINDING|COPY_DST|COPY_SRC' = 23,
  'RENDER_ATTACHMENT|TEXTURE_BINDING|COPY_DST|COPY_SRC|STORAGE_BINDING' = 31,
  'STORAGE_BINDING|COPY_SRC' = 9,
}

export type COPY_SRC_TEXTURE =
  | (typeof TextureUsageEnums)['COPY_SRC']
  | (typeof TextureUsageEnums)['RENDER_ATTACHMENT|COPY_SRC']
  | (typeof TextureUsageEnums)['TEXTURE_BINDING|COPY_DST|COPY_SRC']
  | (typeof TextureUsageEnums)['RENDER_ATTACHMENT|TEXTURE_BINDING|COPY_DST|COPY_SRC']
  | (typeof TextureUsageEnums)['RENDER_ATTACHMENT|TEXTURE_BINDING|COPY_DST|COPY_SRC|STORAGE_BINDING']
  | (typeof TextureUsageEnums)['RENDER_ATTACHMENT|TEXTURE_BINDING|COPY_SRC']
  | (typeof TextureUsageEnums)['STORAGE_BINDING|COPY_SRC'];
type COPY_DST_TEXTURE =
  | (typeof TextureUsageEnums)['COPY_DST']
  | (typeof TextureUsageEnums)['TEXTURE_BINDING|COPY_DST']
  | (typeof TextureUsageEnums)['TEXTURE_BINDING|COPY_DST|COPY_SRC']
  | (typeof TextureUsageEnums)['RENDER_ATTACHMENT|TEXTURE_BINDING|COPY_DST']
  | (typeof TextureUsageEnums)['RENDER_ATTACHMENT|TEXTURE_BINDING|COPY_DST|COPY_SRC']
  | (typeof TextureUsageEnums)['RENDER_ATTACHMENT|TEXTURE_BINDING|COPY_DST|COPY_SRC|STORAGE_BINDING'];
export type STORAGE_BINDING_TEXTURE =
  | (typeof TextureUsageEnums)['RENDER_ATTACHMENT|TEXTURE_BINDING|COPY_DST|COPY_SRC|STORAGE_BINDING']
  | (typeof TextureUsageEnums)['STORAGE_BINDING']
  | (typeof TextureUsageEnums)['STORAGE_BINDING|COPY_SRC'];
export type RENDER_TARGET_TEXTURE =
  | (typeof TextureUsageEnums)['RENDER_ATTACHMENT']
  | (typeof TextureUsageEnums)['RENDER_ATTACHMENT|COPY_SRC']
  | (typeof TextureUsageEnums)['RENDER_ATTACHMENT|TEXTURE_BINDING']
  | (typeof TextureUsageEnums)['RENDER_ATTACHMENT|TEXTURE_BINDING|COPY_DST']
  | (typeof TextureUsageEnums)['RENDER_ATTACHMENT|TEXTURE_BINDING|COPY_DST|COPY_SRC']
  | (typeof TextureUsageEnums)['RENDER_ATTACHMENT|TEXTURE_BINDING|COPY_DST|COPY_SRC|STORAGE_BINDING']
  | (typeof TextureUsageEnums)['RENDER_ATTACHMENT|TEXTURE_BINDING|COPY_SRC'];
export type TEXTURE_BINDING_TEXTURE =
  | (typeof TextureUsageEnums)['TEXTURE_BINDING']
  | (typeof TextureUsageEnums)['TEXTURE_BINDING|COPY_DST']
  | (typeof TextureUsageEnums)['TEXTURE_BINDING|COPY_DST|COPY_SRC']
  | (typeof TextureUsageEnums)['RENDER_ATTACHMENT|TEXTURE_BINDING']
  | (typeof TextureUsageEnums)['RENDER_ATTACHMENT|TEXTURE_BINDING|COPY_DST']
  | (typeof TextureUsageEnums)['RENDER_ATTACHMENT|TEXTURE_BINDING|COPY_DST|COPY_SRC']
  | (typeof TextureUsageEnums)['RENDER_ATTACHMENT|TEXTURE_BINDING|COPY_DST|COPY_SRC|STORAGE_BINDING']
  | (typeof TextureUsageEnums)['RENDER_ATTACHMENT|TEXTURE_BINDING|COPY_SRC'];

export class Texture<
  F extends GPUTextureFormat,
  U extends TextureUsageEnums,
  S extends TextureSize = TextureSize,
> {
  //RenderTarget & Storage
  static create<
    F extends STORAGE_FORMATS & RENDER_TARGET_FORMAT,
    U extends RENDER_TARGET_TEXTURE & STORAGE_BINDING_TEXTURE,
    S extends RenderTargetSize = RenderTargetSize,
  >(props: TextureParamsStorage<F, U, S>): RenderTargetTexture<F, U, S>;
  //RenderTarget
  static create<
    F extends RENDER_TARGET_FORMAT,
    U extends Exclude<RENDER_TARGET_TEXTURE, STORAGE_BINDING_TEXTURE>,
    S extends RenderTargetSize = RenderTargetSize,
  >(props: TextureParams<F, U, S>): RenderTargetTexture<F, U, S>;
  //STORAGE
  static create<
    F extends STORAGE_FORMATS,
    U extends STORAGE_BINDING_TEXTURE,
    S extends TextureSize = TextureSize,
  >(props: TextureParamsStorage<F, U, S>): Texture<F, U, S>;
  static create<
    F extends GPUTextureFormat,
    U extends Exclude<
      TextureUsageEnums,
      STORAGE_BINDING_TEXTURE | RENDER_TARGET_TEXTURE
    >,
    S extends TextureSize = TextureSize,
  >(props: TextureParams<F, U, S>): Texture<F, U, S>;
  static create<
    F extends GPUTextureFormat,
    U extends Exclude<TextureUsageEnums, STORAGE_BINDING_TEXTURE>,
    S extends TextureSize = TextureSize,
  >(props: TextureParams<F, U, S>) {
    return new Texture<F, U, S>(props);
  }
  bytes_per_fixel: number;
  texture: GPUTexture;
  views: Set<TextureView<typeof this>> = new Set();
  protected initialSampleCount: 1 | 4 = 1;
  constructor(
    public props: //@ts-expect-error Texture is always created with static "create" method, giving correct generics
    | TextureParams<F, Exclude<U, TextureUsageType['STORAGE_BINDING']>, S>
      //@ts-expect-error Texture is always created with static "create" method, giving correct generics
      | TextureParamsStorage<F, U, S>,
  ) {
    this.texture = this.createTexture(props.initialSampleCount);
    switch (props.format) {
      case 'r32uint':
      case 'bgra8unorm':
      case 'rgba8unorm':
      case 'rgba8snorm':
      case 'depth32float':
        this.bytes_per_fixel = 4;
        break;
      case 'rgba32float':
        this.bytes_per_fixel = 16;
        break;
      default:
        throw new Error('unknown format ' + props.format);
    }
  }
  copyTo(
    this: Texture<GPUTextureFormat, COPY_SRC_TEXTURE>,
    commandEncoder: GPUCommandEncoder,
    destination: Texture<GPUTextureFormat, COPY_DST_TEXTURE>,
    sourceDetails: Omit<GPUImageCopyTexture, 'texture'>,
    destinationDetails: Omit<GPUImageCopyTexture, 'texture'>,
    copySize: GPUExtent3DStrict,
  ) {
    destination.copyFrom(
      commandEncoder,
      this,
      sourceDetails,
      destinationDetails,
      copySize,
    );
  }
  copyFrom(
    this: Texture<GPUTextureFormat, COPY_DST_TEXTURE>,
    commandEncoder: GPUCommandEncoder,
    from: Texture<GPUTextureFormat, COPY_SRC_TEXTURE>,
    sourceDetails: Omit<GPUImageCopyTexture, 'texture'>,
    destinationDetails: Omit<GPUImageCopyTexture, 'texture'>,
    copySize: GPUExtent3DStrict,
  ) {
    commandEncoder.copyTextureToTexture(
      {
        texture: from.texture,
        ...sourceDetails,
      },
      {
        texture: this.texture,
        ...destinationDetails,
      },
      copySize,
    );
  }
  resize(size: S, sampleCount: 1 | 4) {
    // Resizing the rendertarget only have width and height, use spread operator to maintain depthOrArrayLayers
    this.props.size = {
      ...this.props.size,
      ...size,
    };
    this.createTexture(sampleCount);
  }
  destroy() {
    //Texture is undefined on initial call from constructor
    if (!this.texture) return;
    this.texture.destroy();
    this.views.forEach((view) => view.destroy());
  }
  protected createTexture(sampleCount: 1 | 4 = 1, debug = false) {
    let label = this.props.label;
    if (debug) {
      label += 'debug' + n;
      console.log('create texture', label);
      n = n + 1;
    }
    //Texture is undefined on initial call
    if (this.texture) this.destroy();
    let usages = this.props.usages as number;
    if (debug) {
      usages |= GPUTextureUsage['COPY_SRC'];
    }
    if (this.props.size.width === 0) {
      throw new Error('Texture must have width');
    } else if ('height' in this.props.size && this.props.size.height === 0) {
      throw new Error('Texture must have height');
    }
    this.texture = this.props.gpu.createTexture({
      format: this.props.format,
      label,
      sampleCount: sampleCount,
      size: this.props.size,
      usage: usages,
    });
    this.views.forEach((view) => view.reCreate(debug));

    return this.texture;
  }
  copyFromExternalImage(
    this: RenderTargetTexture,
    source: GPUImageCopyExternalImage,
    destination: Omit<GPUImageCopyTextureTagged, 'texture'> & {
      origin?: GPUOrigin3DDict;
    },
    copySize: GPUExtent3DDict,
  ) {
    if ((this.props.usages & GPUTextureUsage.COPY_DST) === 0) {
      throw new Error('copyFromExternalImage: texture must include COPY_DST.');
    }
    if (
      (destination.origin?.y ?? 0) + (copySize.height ?? 0) >
      this.props.size.height
    ) {
      throw new Error(
        'copyFromExternalImage height touches outside of texture ',
      );
    }
    if (
      (destination.origin?.x ?? 0) + (copySize.width ?? 0) >
      this.props.size.width
    ) {
      throw new Error(
        'copyFromExternalImage width touches outside of texture ',
      );
    }
    this.props.gpu.queue.copyExternalImageToTexture(
      source,
      {
        ...destination,
        texture: this.texture,
      },
      copySize,
    );
  }
  async toBitmap(this: RenderTargetTexture, depth = 0) {
    /*  if (this.renderPass.sampleCount > 1 && !this.resolveTexture) {
              throw (new Error('Printing MSAA swap target is not supported'))
          }*/

    //Use for debugging purpose.
    //this.#debug = true;
    let add_copy_src = false;
    if ((this.props.usages & TextureUsageEnums.COPY_SRC) === 0) {
      add_copy_src = true;
      this.createTexture(this.initialSampleCount, true);
      await new Promise((res) => {
        requestAnimationFrame(res);
      });
      await new Promise((res) => {
        requestAnimationFrame(res);
      });
    }

    const encoder = this.props.gpu.createCommandEncoder({
      label: 'texture_toBitmap_encoder',
    });
    let bytesPerRow = this.props.size.width * this.bytes_per_fixel;
    const missAlignment = bytesPerRow % 256;
    if (missAlignment !== 0) {
      bytesPerRow = bytesPerRow - missAlignment + 256;
    }
    const buffer = this.props.gpu.createBuffer({
      size: bytesPerRow * this.props.size.height,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
    });
    encoder.copyTextureToBuffer(
      {
        origin: [0, 0, depth],
        texture: this.texture,
      },
      {
        buffer: buffer,
        bytesPerRow: bytesPerRow,
        rowsPerImage: this.props.size.height,
      },
      this.props.size,
    );
    this.props.gpu.queue.submit([encoder.finish()]);
    await buffer.mapAsync(GPUMapMode.READ);

    let data: Uint8ClampedArray;
    if (this.bytes_per_fixel > 4) {
      const floatData = new Float32Array(buffer.getMappedRange());
      data = new Uint8ClampedArray(
        this.props.size.width * this.props.size.height * 4,
      );
      for (let i = 0; i < data.length; i += 4) {
        const index = i;
        const length = Math.hypot(
          floatData[index]!,
          floatData[index + 1]!,
          floatData[index + 2]!,
        );
        //const length=Math.max(floatData[index]!,floatData[index+1]!,floatData[index+2]!)
        data[i] = (floatData[index]! / length) * 255;
        data[i + 1] = (floatData[index + 1]! / length) * 255;
        data[i + 2] = (floatData[index + 2]! / length) * 255;
        data[i + 3] = 255;
      }
    } else {
      data = new Uint8ClampedArray(buffer.getMappedRange().slice(0));
    }
    buffer.unmap();
    buffer.destroy();
    if (add_copy_src) {
      this.createTexture(this.initialSampleCount);
    }
    return data;
  }
  async print_bitmap(this: RenderTargetTexture) {
    let bytesPerRow = this.props.size.width * this.bytes_per_fixel;
    const missAlignment = bytesPerRow % 256;
    if (missAlignment !== 0) {
      bytesPerRow = bytesPerRow - missAlignment + 256;
    }

    const c = document.createElement('canvas');
    c.width = this.props.size.width;
    c.height = this.props.size.height;

    const ctx = c.getContext('2d');
    if (!ctx) {
      throw new Error('Cannot get context');
    }
    const imageData = ctx.createImageData(
      bytesPerRow / this.bytes_per_fixel,
      c.height,
    );
    const data = await this.toBitmap();
    imageData.data.set(data);
    ctx.putImageData(imageData, 0, 0);
    c.toBlob(
      (b) => {
        if (!b) {
          throw new Error('Blob creation failed');
        }
        console.log(URL.createObjectURL(b));
      },
      'image/jpeg',
      0.96,
    );
  }
}
