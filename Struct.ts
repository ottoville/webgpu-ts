/* eslint-disable sort-keys */

type IntegerTypes = 'i32' | 'u32';
type FloatingPointTypes = 'f16' | 'f32';
type dimensions = '2' | '3' | '4';
type Vectors = `vec${dimensions}`;
type VectorTypes = `${Vectors}<${IntegerTypes | FloatingPointTypes}>`;
type Matrices = `mat${dimensions}x${dimensions}`;
type MatrixTypes = `${Matrices}<${FloatingPointTypes}>`;
type ArrayType = `array<${string}>`;

export type wgslType =
  | IntegerTypes
  | FloatingPointTypes
  | VectorTypes
  | MatrixTypes
  | ArrayType;

export class Struct<
  const T extends {
    [index: string]: readonly [properties: string, type: wgslType];
  } = { [index: string]: readonly [size: string, type: wgslType] },
> {
  readonly properties: T;
  readonly depedencies?: readonly Struct[];
  constructor(
    public readonly name: string,
    properties: T,
    depedencies?: Struct[],
  ) {
    this.properties = Object.freeze(properties);
    if (depedencies) this.depedencies = Object.freeze(depedencies);
  }
  getPropertiesAsString() {
    let properties = '';
    for (const property in this.properties) {
      properties += `${this.properties[property]![0]} ${property}: ${
        this.properties[property]![1]
      },\n`;
    }
    return properties;
  }
}
export const diffuseOutput = new Struct('Output', {
  Diffuse: ['@location(0)', 'vec4<f32>'],
});
export const UI_Input = new Struct('Output', {
  Position: ['@builtin(position)', 'vec4<f32>'],
  v_uv: ['@location(0)', 'vec2<f32>'],
});
export const position_vec2 = new Struct('Position', {
  position: ['', 'vec2<i32>'],
});
export const position_vec2f32 = new Struct('Position2', {
  translate: ['', 'vec2<f32>'],
});
