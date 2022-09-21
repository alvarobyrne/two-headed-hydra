import "./style.css";
import REGL from "regl";
import { Hydra, generators } from "hydra-ts";
import ArrayUtils from "hydra-ts/src/lib/array-utils";
import Editor from "./Editor";
import createHydraAutocomplete from "./hydra-autocomplete";

const WIDTH = 512;
const HEIGHT = 512;
const DENSITY = 2;
const getCanvas = (parent: HTMLElement): HTMLCanvasElement => {
  const canvas = document.createElement("canvas");
  canvas.style.backgroundColor = "#000000";
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  parent.appendChild(canvas);
  return canvas;
};

ArrayUtils.init();

let hydraAutocomplete;
class HydraInstance {
  hydra: Hydra;
  constructor(canvas: HTMLCanvasElement) {
    const regl = REGL(canvas);

    const hydra = new Hydra({
      width: WIDTH * DENSITY,
      height: HEIGHT * DENSITY,
      precision: "mediump",
      regl,
    });
    this.hydra = hydra;
    const { sources, outputs, render } = this.hydra;
    const [o0, o1, o2, o3] = outputs;

    hydra.loop.start();
    hydra.render();
  }
  eval(code) {
    const { sources, outputs, render } = this.hydra;
    const [s0, s1, s2, s3] = sources;
    const [o0, o1, o2, o3] = outputs;
    //@ts-ignore
    const { src, osc, gradient, shape, voronoi, noise } = generators;
    eval(code);
  }
  render() {
    this.hydra.render();
  }
}
const APP_ELEMENT = document.body.querySelector("#app");

const h1 = new HydraInstance(getCanvas(APP_ELEMENT));
const h2 = new HydraInstance(getCanvas(APP_ELEMENT));
setTimeout(() => {
  h1.eval("osc().out(o0)");
  console.log("pin");
  h2.eval("voronoi().out(o0)");
}, 1000);
hydraAutocomplete = createHydraAutocomplete(h1.hydra);
const e = new Editor(hydraAutocomplete);
console.log("e: ", e);
