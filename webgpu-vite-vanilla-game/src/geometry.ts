export class QuadGeometry {
    public positions: number[];
    public colors: number[];
    public textCoords: number[];
    public indices: number[];

    constructor() {
        this.positions = [
            -0.5, -0.5,
            0.5, -0.5,
            -0.5, 0.5,
            0.5, 0.5,
        ];
        this.colors = [
            1.0, 1.0, 1.0,
            1.0, 1.0, 1.0,
            1.0, 1.0, 1.0,
            1.0, 1.0, 1.0,
        ];
        this.textCoords = [
            0.0, 1.0,
            1.0, 1.0,
            0.0, 0.0,
            1.0, 0.0,
        ];
        this.indices = [
            0, 1, 2,
            1, 2, 3,
        ];
    }
}