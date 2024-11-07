import { Buffer, BufferUsageEnums } from '../Buffer';
declare const gpu: GPUDevice;

const bufferNotMapped = new Buffer({
  gpu,
  label: 'test',
  size: 123,
  usages: BufferUsageEnums.COPY_SRC,
});
//@ts-expect-error buffer is not mapped
bufferNotMapped.unmap();
const bufferMapped = new Buffer({
  gpu,
  label: 'test',
  mappedAtCreation: true,
  size: 123,
  usages: BufferUsageEnums.COPY_SRC,
});
bufferMapped.unmap();

const bufferMappedWithCallback = new Buffer({
  gpu,
  label: 'test',
  mappedAtCreation: true,
  size: 123,
  usages: BufferUsageEnums.COPY_SRC,
});
bufferMappedWithCallback.getMappedRange(1, 2);
//@ts-expect-error buffer is no longer mapped
bufferMappedWithCallback.unmap().unmap();
