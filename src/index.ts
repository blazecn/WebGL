import Program from "./program";
const canvas = document.getElementById("canvas") as HTMLCanvasElement;

function makeCanvasFullScreen(canvas: HTMLCanvasElement) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

makeCanvasFullScreen(canvas);
window.onresize = () => {
  makeCanvasFullScreen(canvas);
};

const gl = canvas.getContext("webgl2");
if (!gl) {
  throw new Error("WebGL2 not supported");
}
const vsSource = require("./shaders/vertex.glsl") as string;
const fsSource = require("./shaders/fragment.glsl") as string;
const program = new Program(gl, vsSource, fsSource);

program.draw();
