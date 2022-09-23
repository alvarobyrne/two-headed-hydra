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

export default class Editor extends EventEmitter {
  constructor(autoComplete: CompletionSource) {
    super();
    // const emitter = new EventEmitter();
    // console.log("emitter: ", emitter);
    const config = new HydraEditorConfiguration();

    const parent = document.querySelector("#editor");
    const hydraExtension = config.getConfiguration(autoComplete);
    const view = new EditorView({
      lineWrapping: true,
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
    // return;
    (async () => {
      const code = await fetch("code.txt");
      const response = await code.text();
      // console.log("response: ", response);
      // console.log("code: ", code);
      const transaction = view.state.update({
        changes: { from: 0, insert: response },
      });
      view.dispatch(transaction);
    })();
  }
}
