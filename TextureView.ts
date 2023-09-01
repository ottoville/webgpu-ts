import type { BindGroup } from './BindGroup';
import { Bindable } from './Bindable';
import type { Renderpass } from './Renderpass';
import type {
  STORAGE_BINDING_TEXTURE,
  TEXTURE_BINDING_TEXTURE,
  Texture,
  TextureUsageEnums,
} from './Texture';

let n = 0;
export class TextureView<
  T extends Texture<GPUTextureFormat, TextureUsageEnums> = Texture<
    GPUTextureFormat,
    TextureUsageEnums
  >,
> extends Bindable {
  //To track when texture is assigned as render target
  readonly #renderPasses: Set<Renderpass> = new Set();

  //TODO: set private
  view: GPUTextureView;
  readonly descriptor: Readonly<GPUTextureViewDescriptor>;
  constructor(
    public texture: T,
    descriptor: GPUTextureViewDescriptor = {},
  ) {
    super();
    descriptor.label = texture.props.label + 'View';
    this.descriptor = Object.freeze(descriptor);
    this.view = this.reCreate();
    texture.views.add(this);
  }
  reCreate(debug = false) {
    this.destroy();
    let label = this.descriptor.label ?? '';
    if (debug) {
      label = this.descriptor.label! + 'debug' + n;
      console.log('create textureview', label);
      n += 1;
    }
    this.view = this.texture.texture.createView({
      ...this.descriptor,
      label: label,
    });
    return this.view;
  }
  getTextureBinding(
    this: TextureView<Texture<GPUTextureFormat, TEXTURE_BINDING_TEXTURE>>,
    bindGroup: BindGroup,
  ): GPUTextureView {
    this.bindGroups.add(bindGroup);
    return this.view;
  }
  getStorageBinding(
    this: TextureView<Texture<GPUTextureFormat, STORAGE_BINDING_TEXTURE>>,
    bindGroup: BindGroup,
  ): GPUTextureView {
    this.bindGroups.add(bindGroup);
    return this.view;
  }
  getAsRenderTarget(renderPass: Renderpass) {
    this.#renderPasses.add(renderPass);
    return this.view;
  }
  override destroy(): void {
    this.#renderPasses.forEach((rp) => {
      rp.bundles.forEach((bundle) => bundle.destroy());
    });
    super.destroy();
  }
}
