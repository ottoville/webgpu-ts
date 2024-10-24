import type { BGLayout, MapToGPUBindGroupEntry } from './BindgroupLayout.js';
import type { RenderBundleEncoder } from './RenderbundleEncoder.js';
import { TextureView } from './TextureView.js';

export type BindGroupRef = {
  readonly bindGroup: BindGroup;
  readonly offsets?: readonly number[];
};

export class BindGroup<L extends BGLayout = BGLayout> {
  #dirty = true;
  #bindGroup?: GPUBindGroup;
  readonly #renderBundles: Set<RenderBundleEncoder> = new Set();
  getForRenderBundle(renderBundleEncoder: RenderBundleEncoder) {
    this.#renderBundles.add(renderBundleEncoder);
    return this.bindGroup;
  }
  destroy() {
    this.#renderBundles.forEach((bundle) => bundle.destroy());
    this.#dirty = true;
  }
  //TODO: set private
  get bindGroup(): GPUBindGroup {
    if (this.#dirty || !this.#bindGroup) {
      const entries = this.entriesf(this);
      this.#bindGroup = this.layout.gpu.createBindGroup({
        entries: Object.values(entries).map((entry, i) => {
          return {
            binding: i,
            resource:
              entry instanceof TextureView
                ? entry.getTextureBinding(this)
                : entry,
          };
        }),
        label: this.label,
        layout: this.layout.layout,
      });
      this.#dirty = false;
    }
    return this.#bindGroup;
  }
  constructor(
    public readonly layout: L,
    private readonly label: string,
    private readonly entriesf: (
      bindGroup: BindGroup,
    ) => Readonly<MapToGPUBindGroupEntry<L['entries']>>,
  ) {}
}
