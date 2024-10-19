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

const size_rx = /@size\((.*)\)/;
const arr_rx = /array<(.*)>/;
export class Struct<
  const T extends {
    [index: string]: StructProperty;
  } = { [index: string]: StructProperty },
> {
  readonly properties: {
    [K in keyof T]: T[K] & {
      offset: number;
      size: number;
      vertexFormat: string | undefined;
    };
  };
  readonly depedencies?: readonly Struct[];
  stride = 0;
  #array?: Struct<{
    values: StructProperty<`array<${string}>`>;
  }>;
  get asArray() {
    if (!this.#array) {
      this.#array = new Struct(
        `${this.name}_arr`,
        {
          values: new StructProperty('', `array<${this.name}>`),
        },
        [this],
      );
    }
    return this.#array;
  }
  constructor(
    public readonly name: string,
    properties: T,
    depedencies?: Struct[],
  ) {
    this.properties = Object.freeze(
      Object.fromEntries(
        Object.entries(properties).map(([k, property]) => {
          const arr_match = arr_rx.exec(property.type);
          if (arr_match) {
            // Array type, not supported in vertex input.
            // Dont know what to do it now, just return someting now
            return [
              k,
              {
                offset: 0,
                size: 0,
                vertexFormat: undefined,
                ...property,
              },
            ] as const;
          }

          const type = wgslTypes[property.type];
          if (!type) {
            throw new Error('unknown type ' + property.type);
          }
          const sizeMatch = size_rx.exec(property.decoration);
          const oldOffset = this.stride;
          if (sizeMatch) {
            this.stride += Math.max(
              Number.parseFloat(sizeMatch[1]!),
              type.size,
            );
          } else {
            this.stride += type.size;
          }
          return [
            k,
            {
              offset: oldOffset,
              size: type.size,
              vertexFormat: type.vertex,
              ...property,
            },
          ] as const;
        }),
      ),
    ) as {
      [K in keyof T]: T[K] & {
        offset: number;
        size: number;
        vertexFormat: string | undefined;
      };
    };
    if (depedencies) this.depedencies = Object.freeze(depedencies);
  }
  getPropertiesAsString() {
    let properties = '';
    for (const property in this.properties) {
      properties += `${this.properties[property]!.decoration} ${property}: ${
        this.properties[property]!.type
      },\n`;
    }
    return properties;
  }
}

type WebGPUType = {
  size: number;
  vertex?: GPUVertexFormat;
};

const wgslTypes: { [index: string]: WebGPUType } = {
  f32: {
    size: 4,
    vertex: 'float32',
  },
  'mat3x3<f32>': {
    size: 48,
  },
  'mat4x4<f32>': {
    size: 64,
  },
  u32: {
    size: 4,
    vertex: 'uint32',
  },
  'vec2<f32>': {
    size: 8,
    vertex: 'float32x2',
  },
  'vec2<i32>': {
    size: 8,
    vertex: 'sint32x2',
  },
  'vec2<u32>': {
    size: 8,
    vertex: 'uint32x2',
  },
  'vec3<f32>': {
    size: 12,
    vertex: 'float32x3',
  },
  'vec4<f32>': {
    size: 16,
    vertex: 'float32x4',
  },
};

export class StructProperty<T extends wgslType = wgslType> {
  constructor(
    public readonly decoration: string,
    public readonly type: T,
    public overrideVertexType?: wgslType,
  ) {}
}
export const diffuseOutput = new Struct('Output', {
  Diffuse: new StructProperty('@location(0)', 'vec4<f32>'),
});
export const UI_Input = new Struct('Output', {
  Position: new StructProperty('@builtin(position)', 'vec4<f32>'),
  v_uv: new StructProperty('@location(0)', 'vec2<f32>'),
});
export const UI_Input2 = new Struct('Output', {
  Position: new StructProperty('@builtin(position)', 'vec4<f32>'),
  v_uv2: new StructProperty('@location(0)', 'vec2<f32>'),
});
export const position_vec2 = new Struct('Position', {
  position: new StructProperty('', 'vec2<i32>'),
});
export const position_vec2f32 = new Struct('Position2', {
  translate: new StructProperty('', 'vec2<f32>'),
});
