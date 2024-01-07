import triangleShader from "./shaders/triangle.wgsl?raw";

export class Renderer {
    private context!: GPUCanvasContext;
    private device!: GPUDevice;
    private pipeline!: GPURenderPipeline;
    private vertexBuffer!: GPUBuffer;
    private colorsBuffer!: GPUBuffer;

    public async initialize() {
        if (!navigator.gpu) {
            throw new Error("WebGPU not supported on this browser.");
        }
        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) {
            throw new Error("No appropriate GPUAdapter found.");
        }
        this.device = await adapter.requestDevice();
        const canvas = document.getElementById('canvas') as HTMLCanvasElement;        
        this.context = canvas.getContext('webgpu')!;
        const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
        this.context.configure({
            device: this.device,
            format: canvasFormat,
        });

        this.vertexBuffer = this.createBuffer(new Float32Array([
            -0.5, -0.5,
            0.5, -0.5,
            0.0, 0.5
        ]), "Cell vertices");
        this.colorsBuffer = this.createBuffer(new Float32Array([
           1.0, 0.0, 0.0,
           0.0, 1.0, 0.0,
           0.0, 0.0, 1.0,
        ]), "Cell colors");

        this.loadShader(canvasFormat);
    }

    public draw() {
        const encoder = this.device.createCommandEncoder();
        const pass = encoder.beginRenderPass({
            colorAttachments: [{
               view: this.context.getCurrentTexture().createView(),
               loadOp: "clear",
               clearValue: { r: 0.67, g: 0.67, b: 0.67, a: 1 },
               storeOp: "store",
            }]
        });
        pass.setPipeline(this.pipeline);
       
        pass.setVertexBuffer(0, this.vertexBuffer);
        pass.setVertexBuffer(1, this.colorsBuffer);

        pass.draw(3);
        pass.end();
        this.device.queue.submit([encoder.finish()]);
    }

    private loadShader(canvasFormat: GPUTextureFormat) {
        const shaderModule = this.device.createShaderModule({
            code: triangleShader,
        });

        const vertexBufferLayout: GPUVertexBufferLayout = {
            arrayStride: 2 * Float32Array.BYTES_PER_ELEMENT,
            attributes: [{
                format: "float32x2",
                offset: 0,
                shaderLocation: 0, // Position, see vertex shader
            }],
        };

        const colorsBufferLayout: GPUVertexBufferLayout = {
            arrayStride: 3 * Float32Array.BYTES_PER_ELEMENT,
            attributes: [{
                format: "float32x3",
                offset: 0,
                shaderLocation: 1, // colors, see vertex shader
            }],
        };        

        this.pipeline = this.device.createRenderPipeline({
            vertex: {
                module: shaderModule,
                entryPoint: "vertexMain",
                buffers: [vertexBufferLayout, colorsBufferLayout]
            },
            fragment: {
                module: shaderModule,
                entryPoint: "fragmentMain",
                targets: [{ format: canvasFormat }]
            },
            label: "triangle",
            layout: "auto",
            primitive: {
                topology: "triangle-list"
            },            
        });        
    }

    private createBuffer(vertices: Float32Array, label: string): GPUBuffer {
        const buffer = this.device.createBuffer({
            label,
            size: vertices.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true
          });
      
          new Float32Array(buffer.getMappedRange()).set(vertices);
          buffer.unmap();
      
          return buffer;
    }
}