import triangleShader from "./shaders/shader.wgsl?raw";
import { QuadGeometry } from "./geometry";
import { Texture } from "./texture";
import { BufferUtil } from "./buffer-util";
import { Camera } from "./camera";
import { Content } from "./content";

export class Renderer {
    private context!: GPUCanvasContext;
    private device!: GPUDevice;
    private pipeline!: GPURenderPipeline;

    private vertexBuffer!: GPUBuffer;
    private indexBuffer!: GPUBuffer;
    private projectionViewMatrixBuffer!: GPUBuffer;

    private textureBindGroup!: GPUBindGroup;
    private projectionBindGroup!: GPUBindGroup;

    private texture1!: Texture;

    private camera!: Camera;

    public async initialize() {
        if (!navigator.gpu) {
            throw new Error("WebGPU not supported on this browser.");
        }
        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) {
            throw new Error("No appropriate GPUAdapter found.");
        }        
        this.device = await adapter.requestDevice();
        await Content.initialize(this.device);
        const canvas = document.getElementById('canvas') as HTMLCanvasElement;        
        this.camera = new Camera(canvas.width, canvas.height);
        this.context = canvas.getContext('webgpu')!;
        const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
        this.context.configure({
            device: this.device,
            format: canvasFormat,
        });
        const geometry = new QuadGeometry();

        this.projectionViewMatrixBuffer = BufferUtil.createUniformBuffer(this.device, new Float32Array(16), "Cell uniform");
        this.vertexBuffer = BufferUtil.createVertexBuffer(this.device, new Float32Array(geometry.vertices), "Cell vertices");
        this.indexBuffer = BufferUtil.createIndexBuffer(this.device, new Uint16Array(geometry.indices), "Cell indices");

        this.texture1 = await Texture.createTextureFromUrl(this.device, "assets/uv_test.png");

        this.loadShader(canvasFormat);
    }

    public draw() {
        this.camera.update();
        const encoder = this.device.createCommandEncoder();
        const pass = encoder.beginRenderPass({
            colorAttachments: [{
               view: this.context.getCurrentTexture().createView(),
               loadOp: "clear",
               clearValue: { r: 0.67, g: 0.67, b: 0.67, a: 1 },
               storeOp: "store",
            }]
        });

        this.device.queue.writeBuffer(
            this.projectionViewMatrixBuffer,
            0,
            this.camera.projectionViewMatrix as Float32Array
        );

        pass.setPipeline(this.pipeline);

        pass.setIndexBuffer(this.indexBuffer, "uint16");
       
        pass.setVertexBuffer(0, this.vertexBuffer);

        pass.setBindGroup(0, this.projectionBindGroup);
        pass.setBindGroup(1, this.textureBindGroup);

        pass.drawIndexed(6);

        pass.end();
        
        this.device.queue.submit([encoder.finish()]);
    }

    private loadShader(canvasFormat: GPUTextureFormat) {
        const shaderModule = this.device.createShaderModule({
            code: triangleShader,
        });

        const vertexBufferLayout: GPUVertexBufferLayout = {
            arrayStride: 7 * Float32Array.BYTES_PER_ELEMENT,
            attributes: [
                {
                    format: "float32x2",
                    offset: 0,
                    shaderLocation: 0, // position
                },
                {
                    format: "float32x2",
                    offset: 2 * Float32Array.BYTES_PER_ELEMENT,
                    shaderLocation: 1, // uv 
                },
                {
                    format: "float32x3",
                    offset: 4 * Float32Array.BYTES_PER_ELEMENT,
                    shaderLocation: 2, // rgb
                },
        ],
        };

        const projectionBindGroupLayout = this.device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: {
                        type: "uniform"
                    }
                }
            ]
        });

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
                projectionBindGroupLayout,
                textureBindGroupLayout
            ]
        });

        this.projectionBindGroup = this.device.createBindGroup({
            layout: projectionBindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: this.projectionViewMatrixBuffer
                    }
                },
            ]
        })

        this.textureBindGroup = this.device.createBindGroup({
            layout: textureBindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: Content.playerTexture.sampler,
                }, {
                    binding: 1,
                    resource: Content.playerTexture.texture.createView()
                }
            ]
        })

        this.pipeline = this.device.createRenderPipeline({
            vertex: {
                module: shaderModule,
                entryPoint: "vertexMain",
                buffers: [vertexBufferLayout]
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