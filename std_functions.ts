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
        texture: TextLayout<
          ShaderStage,
          | 'texture_2d<f32>'
          | 'texture_depth_multisampled_2d'
          | 'texture_2d<u32>'
        >,
        coords: string,
        level: number,
      ]
    | [
        texture: TextLayout<ShaderStage, 'texture_2d_array<f32>'>,
        coords: string,
        arrayIndex: string,
        level: number,
      ]
) {
  return /* wgsl */ `textureLoad(${args.join()})`;
}
