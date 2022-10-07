import "./style.css";
import REGL from "regl";
import { Hydra, generators } from "hydra-ts";
import ArrayUtils from "hydra-ts/src/lib/array-utils";
import Editor from "./Editor";
import createHydraAutocomplete from "./hydra-autocomplete";
import { EVAL_BLOCK_EVENT } from "./hydra-environment/keymaps";

const WIDTH = 512;
const HEIGHT = 512;
const DENSITY = 2;
const getCanvas = (parent: Element | null): HTMLCanvasElement => {
  const canvas = document.createElement("canvas");
  canvas.style.backgroundColor = "#000000";
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  if (parent) parent.appendChild(canvas);
  return canvas;
};
//According to @folz, ArrayUtils must be initialized before running hydra-ts,
// see https://github.com/folz/hydra-ts#differences-from-the-original-hydra-synth
//so, the following line of code:
ArrayUtils.init();

class HydraInstance {
  hydra: Hydra;
  constructor(canvas: HTMLCanvasElement) {
    const regl = REGL(canvas) as any;

    const hydra = new Hydra({
      width: WIDTH * DENSITY,
      height: HEIGHT * DENSITY,
      precision: "mediump",
      regl,
    });
    this.hydra = hydra;

    hydra.loop.start();
    hydra.render();
  }
  eval(code: string) {
    try {
      const { sources, outputs, render } = this.hydra;
      const [s0, s1, s2, s3] = sources;
      const [o0, o1, o2, o3] = outputs;
      //@ts-ignore
      const { src, osc, gradient, shape, voronoi, noise } = generators;
      //@ts-ignore
      const time = this.hydra.synth.time;
      eval(code);
    } catch (e) {
      console.log("e: ", e);
    }
  }
  render() {
    this.hydra.render();
  }
}
const APP_ELEMENT = document.body.querySelector("#app");

const h0 = new HydraInstance(getCanvas(APP_ELEMENT));
const h1 = new HydraInstance(getCanvas(APP_ELEMENT));
setTimeout(() => {
  h0.eval("osc().out(o0)");
  // console.log("pin");
  h1.eval("voronoi().out(o0)");
}, 1000);
const hydraAutocomplete = createHydraAutocomplete(h0.hydra);
// const hydraAutocomplete1 = createHydraAutocomplete(h1.hydra);
const onCodeChange = (hydraInstance: HydraInstance) => (blockOfCode: string) =>
  hydraInstance.eval(blockOfCode);
const editorDom0 = document.querySelector("#editor0");
const editorDom1 = document.querySelector("#editor1");
if (editorDom0 && editorDom1) {
  const e0 = new Editor(hydraAutocomplete, editorDom0);
  e0.on(EVAL_BLOCK_EVENT, onCodeChange(h0));
  const e1 = new Editor(hydraAutocomplete, editorDom1);
  e1.on(EVAL_BLOCK_EVENT, onCodeChange(h1));
}
