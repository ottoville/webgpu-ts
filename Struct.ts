/* eslint-disable sort-keys */

export class Struct<
  const T extends {
    [index: string]: readonly [properties: string, type: string];
  } = { [index: string]: readonly [size: string, type: string] },
> {
  constructor(
    public name: string,
    public properties: T,
    public depedencies?: Struct[],
  ) {}
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
