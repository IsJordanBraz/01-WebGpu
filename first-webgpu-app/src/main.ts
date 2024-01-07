import { Renderer } from "./Renderer";

const renderer = new Renderer();
renderer.initialize().then(() => renderer.draw());