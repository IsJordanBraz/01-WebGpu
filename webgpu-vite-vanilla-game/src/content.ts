import { Texture } from "./texture";

export class Content {
    public static playerTexture: Texture;

    public static async initialize(device: GPUDevice): Promise<void> {
        Content.playerTexture = await Texture.createTextureFromUrl(device, "assets/ship1.png");
    }
}