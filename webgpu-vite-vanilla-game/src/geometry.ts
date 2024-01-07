export class QuadGeometry {
    public vertices: number[];
    public indices: number[];

    constructor() {

        const x = 100;
        const y = 100;
        const w = 99;
        const h = 75;

        this.vertices = [
            // x, y, uv.x, uv.y, r, g, b
            x, y, 0.0, 0.0, 1.0, 1.0, 1.0,
            x + w, y, 1.0, 0.0, 1.0, 1.0, 1.0,
            x + w, y + h, 1.0, 1.0, 1.0, 1.0, 1.0,
            x, y + h, 0.0, 1.0, 1.0, 1.0, 1.0,
        ];
        this.indices = [
            0, 1, 2,
            2, 3, 0,
        ];
    }
}