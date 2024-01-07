import triangleShader from "./shaders/shader.wgsl?raw";
import { QuadGeometry } from "./geometry";
import { Texture } from "./texture";
import { BufferUtil } from "./buffer-util";

export class Renderer {
    private context!: GPUCanvasContext;
    private device!: GPUDevice;
    private pipeline!: GPURenderPipeline;

    private vertexBuffer!: GPUBuffer;
    private colorsBuffer!: GPUBuffer;
    private indexBuffer!: GPUBuffer;

    private textCoordsBuffer!: GPUBuffer;
    private textureBindGroup!: GPUBindGroup;

    private texture1!: Texture;

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
        const geometry = new QuadGeometry();

        this.vertexBuffer = BufferUtil.createVertexBuffer(this.device, new Float32Array(geometry.positions), "Cell vertices");
        this.colorsBuffer = BufferUtil.createVertexBuffer(this.device, new Float32Array(geometry.colors), "Cell colors");
        this.textCoordsBuffer = BufferUtil.createVertexBuffer(this.device, new Float32Array(geometry.textCoords), "Cell texture");
        this.indexBuffer = BufferUtil.createIndexBuffer(this.device, new Uint16Array(geometry.indices), "Cell indices");
        this.texture1 = await Texture.createTextureFromUrl(this.device, "assets/uv_test.png");

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

        pass.setIndexBuffer(this.indexBuffer, "uint16");
       
        pass.setVertexBuffer(0, this.vertexBuffer);
        pass.setVertexBuffer(1, this.colorsBuffer);

        pass.setVertexBuffer(2, this.textCoordsBuffer);
        pass.setBindGroup(0, this.textureBindGroup);

        pass.drawIndexed(6);
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

        const textureBufferLayout: GPUVertexBufferLayout = {
            arrayStride: 2 * Float32Array.BYTES_PER_ELEMENT,
            attributes: [{
                format: "float32x2",
                offset: 0,
                shaderLocation: 2, // colors, see vertex shader
            }],
        }; 

        const textureBindGroupLayout = this.device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.FRAGMENT,
                    sampler: {}
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: {}
                }
            ]
        });

        const pipelineLayout = this.device.createPipelineLayout({
            bindGroupLayouts: [
                textureBindGroupLayout
            ]
        });

        this.textureBindGroup = this.device.createBindGroup({
            layout: textureBindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: this.texture1.sampler,
                }, {
                    binding: 1,
                    resource: this.texture1.texture.createView()
                }
            ]
        })

        this.pipeline = this.device.createRenderPipeline({
            vertex: {
                module: shaderModule,
                entryPoint: "vertexMain",
                buffers: [vertexBufferLayout, colorsBufferLayout, textureBufferLayout]
            },
            fragment: {
                module: shaderModule,
                entryPoint: "fragmentMain",
                targets: [{ 
                    format: canvasFormat,
                    blend: {
                        color: {
                            srcFactor: "one",
                            dstFactor: "one-minus-src-alpha",
                            operation: "add"
                        },
                        alpha: {
                            srcFactor: "one",
                            dstFactor: "zero",
                            operation: "add"
                        }
                    }
                }]
            },
            label: "triangle",
            layout: pipelineLayout,
            primitive: {
                topology: "triangle-list"
            },            
        });        
    }
}