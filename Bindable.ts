import type { BindGroup } from './BindGroup';

export abstract class Bindable {
  public readonly bindGroups: Set<BindGroup> = new Set();
  destroy() {
    this.bindGroups.forEach((bindGroup) => {
      bindGroup.destroy();
    });
  }
}
