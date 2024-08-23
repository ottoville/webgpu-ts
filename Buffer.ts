import type { BindGroup } from './BindGroup.js';
import { Bindable } from './Bindable.js';
import { RenderBundleEncoder } from './RenderbundleEncoder.js';
import type { COPY_SRC_TEXTURE, Texture } from './Texture.js';

export const enum BufferUsageEnums {
  MAP_READ = 1,
  MAP_WRITE = 2,
  COPY_SRC = 4,
  COPY_DST = 8,
  INDEX = 16,
  VERTEX = 32,
  UNIFORM = 64,
  STORAGE = 128,
  INDIRECT = 256,
  QUERY_RESOLVE = 512,
  'MAP_READ|COPY_DST' = BufferUsageEnums.MAP_READ | BufferUsageEnums.COPY_DST,
  'STORAGE|COPY_SRC' = BufferUsageEnums.STORAGE | BufferUsageEnums.COPY_SRC,
  'STORAGE|COPY_DST' = BufferUsageEnums.STORAGE | BufferUsageEnums.COPY_DST,
  'STORAGE|COPY_SRC|COPY_DST' = BufferUsageEnums.STORAGE |
    BufferUsageEnums.COPY_SRC |
    BufferUsageEnums.COPY_DST,
  'VERTEX|STORAGE' = BufferUsageEnums.VERTEX | BufferUsageEnums.STORAGE,
  'VERTEX|COPY_DST' = BufferUsageEnums.VERTEX | BufferUsageEnums.COPY_DST,
  'VERTEX|STORAGE|COPY_SRC' = BufferUsageEnums.VERTEX |
    BufferUsageEnums.STORAGE |
    BufferUsageEnums.COPY_SRC,
  'VERTEX|STORAGE|COPY_SRC|COPY_DST' = BufferUsageEnums.VERTEX |
    BufferUsageEnums.STORAGE |
    BufferUsageEnums.COPY_SRC |
    BufferUsageEnums.COPY_DST,

  'INDEX|STORAGE|COPY_SRC' = BufferUsageEnums.INDEX |
    BufferUsageEnums.STORAGE |
    BufferUsageEnums.COPY_SRC,

  'UNIFORM|COPY_DST' = BufferUsageEnums.UNIFORM | BufferUsageEnums.COPY_DST,

  'UNIFORM|STORAGE|COPY_DST' = BufferUsageEnums.UNIFORM |
    BufferUsageEnums.STORAGE |
    BufferUsageEnums.COPY_DST,
  'UNIFORM|STORAGE|COPY_SRC|COPY_DST' = BufferUsageEnums.UNIFORM |
    BufferUsageEnums.STORAGE |
    BufferUsageEnums.COPY_SRC |
    BufferUsageEnums.COPY_DST,

  'INDIRECT|COPY_DST' = BufferUsageEnums.INDIRECT | BufferUsageEnums.COPY_DST,
}
type MAP_READ_BUFFER =
  | (typeof BufferUsageEnums)['MAP_READ']
  | (typeof BufferUsageEnums)['MAP_READ|COPY_DST'];
type COPY_SRC_BUFFER =
  | (typeof BufferUsageEnums)['COPY_SRC']
  | (typeof BufferUsageEnums)['STORAGE|COPY_SRC']
  | (typeof BufferUsageEnums)['VERTEX|STORAGE|COPY_SRC']
  | (typeof BufferUsageEnums)['VERTEX|STORAGE|COPY_SRC|COPY_DST']
  | (typeof BufferUsageEnums)['INDEX|STORAGE|COPY_SRC']
  | (typeof BufferUsageEnums)['STORAGE|COPY_SRC|COPY_DST']
  | (typeof BufferUsageEnums)['UNIFORM|STORAGE|COPY_SRC|COPY_DST'];

type COPY_DST_BUFFER =
  | (typeof BufferUsageEnums)['COPY_DST']
  | (typeof BufferUsageEnums)['MAP_READ|COPY_DST']
  | (typeof BufferUsageEnums)['VERTEX|COPY_DST']
  | (typeof BufferUsageEnums)['VERTEX|STORAGE|COPY_SRC|COPY_DST']
  | (typeof BufferUsageEnums)['STORAGE|COPY_DST']
  | (typeof BufferUsageEnums)['STORAGE|COPY_SRC|COPY_DST']
  | (typeof BufferUsageEnums)['UNIFORM|COPY_DST']
  | (typeof BufferUsageEnums)['UNIFORM|STORAGE|COPY_DST']
  | (typeof BufferUsageEnums)['UNIFORM|STORAGE|COPY_SRC|COPY_DST']
  | (typeof BufferUsageEnums)['INDIRECT|COPY_DST'];
type STORAGE_BUFFER =
  | (typeof BufferUsageEnums)['STORAGE']
  | (typeof BufferUsageEnums)['STORAGE|COPY_SRC']
  | (typeof BufferUsageEnums)['STORAGE|COPY_DST']
  | (typeof BufferUsageEnums)['VERTEX|STORAGE']
  | (typeof BufferUsageEnums)['VERTEX|STORAGE|COPY_SRC']
  | (typeof BufferUsageEnums)['VERTEX|STORAGE|COPY_SRC|COPY_DST']
  | (typeof BufferUsageEnums)['INDEX|STORAGE|COPY_SRC']
  | (typeof BufferUsageEnums)['STORAGE|COPY_SRC|COPY_DST']
  | (typeof BufferUsageEnums)['UNIFORM|STORAGE|COPY_DST']
  | (typeof BufferUsageEnums)['UNIFORM|STORAGE|COPY_SRC|COPY_DST'];

type UNIFORM_BUFFER =
  | (typeof BufferUsageEnums)['UNIFORM']
  | (typeof BufferUsageEnums)['UNIFORM|COPY_DST']
  | (typeof BufferUsageEnums)['UNIFORM|STORAGE|COPY_DST']
  | (typeof BufferUsageEnums)['UNIFORM|STORAGE|COPY_SRC|COPY_DST'];
export type VERTEX_BUFFER =
  | (typeof BufferUsageEnums)['VERTEX']
  | (typeof BufferUsageEnums)['VERTEX|STORAGE']
  | (typeof BufferUsageEnums)['VERTEX|COPY_DST']
  | (typeof BufferUsageEnums)['VERTEX|STORAGE|COPY_SRC']
  | (typeof BufferUsageEnums)['VERTEX|STORAGE|COPY_SRC|COPY_DST'];

export type INDEX_BUFFER =
  | (typeof BufferUsageEnums)['INDEX']
  | (typeof BufferUsageEnums)['INDEX|STORAGE|COPY_SRC'];

export type INDIRECT_BUFFER =
  | (typeof BufferUsageEnums)['INDIRECT']
  | (typeof BufferUsageEnums)['INDIRECT|COPY_DST'];

export type BufferProps<
  U extends BufferUsageEnums,
  MAPPED extends boolean = false,
> = {
  gpu: GPUDevice;
  size: number;
  usages: U;
  label: string;
  mapped?: MAPPED;
};

export class Buffer<
  U extends BufferUsageEnums,
  MAPPED extends boolean = boolean,
> extends Bindable {
  renderBundles: Set<RenderBundleEncoder> = new Set();
  readonly #buffer: GPUBuffer;
  constructor(
    public props: BufferProps<U, MAPPED>,
    mappedAtCreation?: (buff: Buffer<U, true>) => void,
  ) {
    if (props.size <= 0) throw new Error('Cannot create zero sized buffer');
    if (props.size > 268435456) {
      //https://gpuweb.github.io/gpuweb/#dom-supported-limits-maxbuffersize
      throw new Error(
        `Tried to create buffer ${props.label} but its too large with size ${props.size}`,
      );
    }
    if (
      (props.usages & BufferUsageEnums.STORAGE) === BufferUsageEnums.STORAGE &&
      props.size > 134217728
    ) {
      //https://gpuweb.github.io/gpuweb/#dom-supported-limits-maxstoragebufferbindingsize
      throw new Error(
        `Tried to create buffer ${props.label} for storage binding but the size is too large with size ${props.size}`,
      );
    }
    super();
    const desc: GPUBufferDescriptor = {
      label: props.label,
      mappedAtCreation: mappedAtCreation || props.mapped ? true : false,
      size: props.size,
      usage: props.usages,
    };
    try {
      this.#buffer = props.gpu.createBuffer(desc);
    } catch (e) {
      throw new Error('Cannot create buffer', {
        cause: e instanceof Error ? e : new Error(new String(e).toString()),
      });
    }
    if (mappedAtCreation) {
      mappedAtCreation(this as Buffer<U, true>);
      this.#buffer.unmap();
    }
  }
  unmap(this: Buffer<BufferUsageEnums, true>) {
    this.#buffer.unmap();
  }
  getMappedRange(
    this: Buffer<BufferUsageEnums, true>,
    offset?: GPUSize64,
    size?: GPUSize64,
  ) {
    return this.#buffer.getMappedRange(offset, size);
  }
  copyFromTexture(
    this: Buffer<COPY_DST_BUFFER>,
    commandEncoder: GPUCommandEncoder,
    from: Texture<GPUTextureFormat, COPY_SRC_TEXTURE>,
    sourceDetails: Omit<GPUImageCopyTexture, 'texture'> | undefined,
    destinationDataLayout: GPUImageDataLayout | undefined,
    copySize: GPUExtent3DStrict,
  ) {
    commandEncoder.copyTextureToBuffer(
      {
        texture: from.texture,
        ...sourceDetails,
      },
      {
        buffer: this.#buffer,
        ...destinationDataLayout,
      },
      copySize,
    );
  }
  async read(
    this: Buffer<MAP_READ_BUFFER>,
    callback: (buff: ArrayBuffer) => Promise<void> | void,
  ) {
    await this.#buffer.mapAsync(GPUMapMode.READ);
    try {
      const arrbuff = this.#buffer.getMappedRange();
      await callback(arrbuff);
    } finally {
      this.#buffer.unmap();
    }
  }
  async readAndDestroy(
    this: Buffer<MAP_READ_BUFFER>,
    callback: (buff: ArrayBuffer) => Promise<void> | void,
  ): Promise<void> {
    await this.#buffer.mapAsync(GPUMapMode.READ);
    const arrbuff = this.#buffer.getMappedRange();
    await callback(arrbuff);
    this.destroy();
  }
  copyFrom(
    this: Buffer<COPY_DST_BUFFER>,
    commandEncoder: GPUCommandEncoder,
    from: Buffer<COPY_SRC_BUFFER>,
    sourceOffset: GPUSize64 = 0,
    destinationOffset: GPUSize64 = 0,
    copySize?: GPUSize64,
  ) {
    commandEncoder.copyBufferToBuffer(
      from.#buffer, // source buffer
      sourceOffset,
      this.#buffer, //destination buffer
      destinationOffset,
      copySize ?? Math.min(from.#buffer.size, this.#buffer.size),
    );
  }

  copyTo(
    this: Buffer<COPY_SRC_BUFFER>,
    commandEncoder: GPUCommandEncoder,
    buffer: Buffer<COPY_DST_BUFFER>,
    sourceOffset?: GPUSize64,
    destinationOffset?: GPUSize64,
    copySize?: GPUSize64,
  ) {
    buffer.copyFrom(
      commandEncoder,
      this,
      sourceOffset,
      destinationOffset,
      copySize,
    );
  }
  #bufferBinding(
    label: string,
    bindGroup: BindGroup,
    offset = 0,
    bindingSize?: GPUSize64,
  ) {
    const obj: GPUBufferBinding & GPUObjectBase = {
      buffer: this.#buffer,
      label: label + '_Binding_for_buffer_' + this.props.label,
      offset,
    };
    if (bindingSize) {
      obj.size = bindingSize;
    }
    this.bindGroups.add(bindGroup);
    return obj;
  }
  getStorageBinding(
    this: Buffer<STORAGE_BUFFER>,
    bindGroup: BindGroup,
    offset = 0,
    bindingSize?: GPUSize64,
  ) {
    return this.#bufferBinding('STORAGE', bindGroup, offset, bindingSize);
  }
  getUniformBinding(
    this: Buffer<UNIFORM_BUFFER>,
    bindGroup: BindGroup,
    offset?: GPUSize64,
    bindingSize?: GPUSize64,
  ) {
    return this.#bufferBinding('UNIFORM', bindGroup, offset, bindingSize);
  }
  getVertexBinding(
    this: Buffer<VERTEX_BUFFER>,
    renderBundle?: RenderBundleEncoder,
  ) {
    if (renderBundle) this.renderBundles.add(renderBundle);
    return this.#buffer;
  }
  getIndexBinding(
    this: Buffer<INDEX_BUFFER>,
    renderBundle?: RenderBundleEncoder,
  ) {
    if (renderBundle) this.renderBundles.add(renderBundle);
    return this.#buffer;
  }
  getIndirectBinding(
    this: Buffer<INDIRECT_BUFFER>,
    renderBundle?: RenderBundleEncoder,
  ) {
    if (renderBundle) this.renderBundles.add(renderBundle);
    return this.#buffer;
  }
  createCopy(this: Buffer<COPY_SRC_BUFFER>, commandEncoder: GPUCommandEncoder) {
    const dst = new Buffer({
      ...this.props,
      usages: BufferUsageEnums['MAP_READ|COPY_DST'],
    });
    this.copyTo(commandEncoder, dst);
    return dst;
  }
  override destroy() {
    this.#buffer.destroy();
    this.renderBundles.forEach((b) => b.destroy());
    super.destroy();
  }
  /**
   * @deprecated This method will invalidate the internal buffer
   */
  resize(this: Buffer<COPY_SRC_BUFFER>, size: number) {
    try {
      const commandEncoder = this.props.gpu.createCommandEncoder({
        label: 'bufferResizeEncoder',
      });
      const newBuffer = this.props.gpu.createBuffer({
        label: this.props.label,
        size,
        usage: this.#buffer.usage | GPUBufferUsage.COPY_DST,
      });
      commandEncoder.copyBufferToBuffer(
        this.#buffer,
        0,
        newBuffer,
        0,
        this.#buffer.size,
      );
      this.props.gpu.queue.submit([commandEncoder.finish()]);
      this.destroy();
      //@ts-expect-error todo
      this.#buffer = newBuffer;
    } catch (e) {
      throw new Error('Cannot create resized buffer', {
        cause: e instanceof Error ? e : new Error(new String(e).toString()),
      });
    }
  }
  /**
   *
   * @deprecated Use something with commandencoder
   *
   * @param bufferOffset Offset in bytes into buffer to begin writing at
   * @param data Data to write into buffer.
   * @param dataOffset Offset in into data to begin writing from. Given in elements if data is a TypedArray and bytes otherwise
   * @param writeSize Size of content to write from data to buffer. Given in elements if data is a TypedArray and bytes otherwise
   */
  write(
    this: Buffer<COPY_DST_BUFFER>,
    bufferOffset: GPUSize64,
    data: BufferSource | SharedArrayBuffer,
    dataOffset?: GPUSize64,
    writeSize?: GPUSize64,
  ) {
    this.props.gpu.queue.writeBuffer(
      this.#buffer,
      bufferOffset,
      data,
      dataOffset,
      writeSize,
    );
  }
}
