import triangleShader from "./shaders/triangle.wgsl?raw";

export class Renderer {
    private context!: GPUCanvasContext;
    private device!: GPUDevice;
    private pipeline!: GPURenderPipeline;

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
        this.loadShader();
    }
    
    public draw() {
        const encoder = this.device.createCommandEncoder();
        const pass = encoder.beginRenderPass({
            colorAttachments: [{
               view: this.context.getCurrentTexture().createView(),
               loadOp: "clear",
               clearValue: { r: 0, g: 0, b: 0.4, a: 1 },
               storeOp: "store",
            }]
        });
        pass.setPipeline(this.pipeline);
        pass.draw(3);
        pass.end();
        this.device.queue.submit([encoder.finish()]);
    }

    private loadShader() {
        const shaderModule = this.device.createShaderModule({
            code: triangleShader,
        });
        const vertexState: GPUVertexState = {
            module: shaderModule,
            entryPoint: "vertexMain",
        };

        const fragmentState: GPUFragmentState = {
            module: shaderModule,
            entryPoint: "fragmentMain",
            targets: [{ format: navigator.gpu.getPreferredCanvasFormat() }]
        };

        this.pipeline = this.device.createRenderPipeline({
            vertex: vertexState,
            fragment: fragmentState,
            label: "triangle",
            layout: "auto",
            primitive: {
                topology: "triangle-list"
            },            
        });        
    }
}