import { StorageTextLayout, TextLayout } from './BindgroupLayout';
import { ShaderStage } from './shaders/Shader';

export const textureStore = (
  texture: StorageTextLayout,
  coords: string,
  value: string,
) => /* wgsl */ `textureStore(${texture}, ${coords}, ${value});\n`;

export function textureLoad(
  ...args:
    | [
        texture: TextLayout<ShaderStage, 'texture_2d<f32>'>,
        coords: string,
        level: string,
      ]
    | [
        texture: TextLayout<ShaderStage, 'texture_2d_array<f32>'>,
        coords: string,
        arrayIndex: string,
        level: string,
      ]
) {
  return /* wgsl */ `textureLoad(${args.join()})`;
}
