import type { BindGroup } from './BindGroup';

export abstract class Destroyable {
  abstract destroy(): void;
}

export abstract class Bindable implements Destroyable {
  public readonly bindGroups: Set<BindGroup> = new Set();
  destroy() {
    this.bindGroups.forEach((bindGroup) => {
      bindGroup.destroy();
    });
  }
}
