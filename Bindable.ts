import type { BindGroup } from './BindGroup';

export abstract class Destroyable {
  static isDestroyable(target: object): target is Destroyable {
    return 'destroy' in target && typeof target.destroy === 'function';
  }
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
