export class BufferUtil {
    public static createVertexBuffer(device: GPUDevice, vertices: Float32Array, label: string): GPUBuffer {
        const buffer = device.createBuffer({
            label,
            size: vertices.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true
          });
      
          new Float32Array(buffer.getMappedRange()).set(vertices);
          buffer.unmap();
      
          return buffer;
    }

    public static createIndexBuffer(device: GPUDevice, vertices: Uint16Array, label: string): GPUBuffer {
        const buffer = device.createBuffer({
            label,
            size: vertices.byteLength,
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true
          });
      
          new Uint16Array(buffer.getMappedRange()).set(vertices);
          buffer.unmap();
      
          return buffer;
    }

    public static createUniformBuffer(device: GPUDevice, vertices: Float32Array, label: string): GPUBuffer {
        const buffer = device.createBuffer({
            label,
            size: vertices.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true
          });
      
          new Uint16Array(buffer.getMappedRange()).set(vertices);
          buffer.unmap();
      
          return buffer;
    }
}