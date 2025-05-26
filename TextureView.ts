import type { BindGroup } from './BindGroup.js';
import { Bindable } from './Bindable.js';
import type {
  STORAGE_BINDING_TEXTURE,
  TEXTURE_BINDING_TEXTURE,
  Texture,
} from './Texture.js';
import type { RenderpassTarget } from './renderTargets/RenderpassTarget.js';

let n = 0;
export class TextureView<T extends Texture = Texture> extends Bindable {
  //To track when texture is assigned as render target
  readonly #renderTargets: Set<RenderpassTarget> = new Set();

  //TODO: set private
  view: GPUTextureView;
  readonly #descriptor: Readonly<GPUTextureViewDescriptor>;
  constructor(
    public texture: T,
    /**
     * The format of the texture view. Must be either the {@link GPUTextureDescriptor#format} of the
     * texture or one of the {@link GPUTextureDescriptor#viewFormats} specified during its creation.
     */
    format: T extends Texture<infer _XU, infer VXF> ? VXF : never,
    descriptor: Omit<GPUTextureViewDescriptor, 'format' | 'label'> = {},
  ) {
    super();
    this.#descriptor = Object.freeze({
      ...descriptor,
      format,
      label: texture.props.label + 'View',
    });
    this.view = this.reCreate();
    texture.views.add(this);
  }
  reCreate(debug = false) {
    this.destroy();
    let label = this.#descriptor.label ?? '';
    if (debug) {
      label = this.#descriptor.label! + 'debug' + n;
      console.log('create textureview', label);
      n += 1;
    }
    this.view = this.texture.texture.createView({
      ...this.#descriptor,
      label: label,
    });
    return this.view;
  }
  getTextureBinding(
    this: TextureView<Texture<TEXTURE_BINDING_TEXTURE>>,
    bindGroup: BindGroup,
  ): GPUTextureView {
    this.bindGroups.add(bindGroup);
    return this.view;
  }
  getStorageBinding(
    this: TextureView<Texture<STORAGE_BINDING_TEXTURE>>,
    bindGroup: BindGroup,
  ): GPUTextureView {
    this.bindGroups.add(bindGroup);
    return this.view;
  }
  getAsRenderTarget(rendertarget: RenderpassTarget) {
    this.#renderTargets.add(rendertarget);
    return this.view;
  }
  override destroy(): void {
    this.#renderTargets.forEach((rt) => {
      rt.dirty = true;
    });
    super.destroy();
  }
}
