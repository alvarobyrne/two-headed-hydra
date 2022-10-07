export const EVAL_BLOCK_EVENT = "editor:evalBlock";
export default {
  "Ctrl-Enter": "editor:evalLine",
  "Ctrl-/": "editor:toggleComment",
  "Alt-Enter": EVAL_BLOCK_EVENT,
  "Shift-Ctrl-Enter": "editor:evalAll",
  "Shift-Ctrl-G": "gallery:shareSketch",
  "Shift-Ctrl-F": "editor:formatCode",
  "Shift-Ctrl-L": "gallery:saveToURL",
  "Shift-Ctrl-H": "hideAll",
  "Shift-Ctrl-S": "screencap",
};
