// import {  } from "codemirror";
import {
  placeholder,
  highlightSpecialChars,
  drawSelection,
  EditorView,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
  highlightActiveLine,
} from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { indentOnInput, bracketMatching } from "@codemirror/language";
import { javascript } from "@codemirror/lang-javascript";
import HydraEditorConfiguration from "./HydraEditorConfiguration";
import EventEmitter from "eventemitter3";
import { type CompletionSource } from "@codemirror/autocomplete";
import { EVAL_BLOCK_EVENT } from "./hydra-environment/keymaps";

export default class Editor extends EventEmitter {
  constructor(autoComplete: CompletionSource, parent: Element | undefined) {
    super();
    // const emitter = new EventEmitter();
    // console.log("emitter: ", emitter);
    const config = new HydraEditorConfiguration();
    config.on("editor:evalLine", (line: string) => {
      console.log("called eval line!");
      // this.emit("editor:evalLine", line);
      // repl.eval(line);
    });

    config.on(EVAL_BLOCK_EVENT, (blockOfCode: string) => {
      this.emit(EVAL_BLOCK_EVENT, blockOfCode);
      // repl.eval(line);
    });
    const hydraExtension = config.getConfiguration(autoComplete);
    const view = new EditorView({
      state: EditorState.create({
        extensions: [
          placeholder("code here"),
          highlightSpecialChars(),
          drawSelection(),
          dropCursor(),
          EditorView.lineWrapping,
          indentOnInput(),
          bracketMatching(),
          rectangularSelection(),
          crosshairCursor(),
          highlightActiveLine(),
          hydraExtension,
          javascript(),
        ],
      }),
      parent,
    });
  }
}
