import { EditorView, keymap } from "@codemirror/view";
import { EditorState, Extension } from "@codemirror/state";
import { tags as t } from "@lezer/highlight";
import {
  HighlightStyle,
  syntaxHighlighting,
  foldKeymap,
} from "@codemirror/language";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import {
  autocompletion,
  completionKeymap,
  closeBrackets,
  closeBracketsKeymap,
  startCompletion,
  type CompletionSource,
} from "@codemirror/autocomplete";
import { oneDark, oneDarkHighlightStyle } from "@codemirror/theme-one-dark";
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search";
import { lintKeymap /*linter*/ } from "@codemirror/lint";
import { commentKeymap } from "@codemirror/comment";
import hydraKeys, { EVAL_BLOCK_EVENT } from "./hydra-environment/keymaps.js";
import { getLine, getBlock } from "./evalKeymaps";
import EventEmitter from "eventemitter3";
import themeObject from "./hydra-environment/theme";

class HydraEditorConfiguration extends EventEmitter {
  constructor() {
    super();
  }
  getConfiguration(autocompleteOptions: CompletionSource): Extension {
    const self = this;
    const hydraKeymaps = Object.entries(hydraKeys).map(([key, val]) => ({
      key: key,
      run: (opts: any) => {
        console.log("called", val, "opts", opts);
        let text: string | boolean = "";
        if (val === "editor:evalLine") {
          text = getLine(opts);
        } else if (val === EVAL_BLOCK_EVENT) {
          text = getBlock(opts);
        }
        console.log("text", text);
        self.emit(val, text);
      },
    }));
    // console.log("keymapOf: ", keymapOf);

    return [
      //  lineNumbers(),
      //   highlightActiveLineGutter(),
      // lineWrapping(),
      history(),
      //  foldGutter(),
      EditorView.domEventHandlers({
        click: (event, view) => {
          console.log("click", event, view);
          // startCompletion(view)
        },
        touchstart: (_, view) => {
          startCompletion(view);
        },
      }),
      EditorState.allowMultipleSelections.of(true),
      syntaxHighlighting(
        HighlightStyle.define([
          { tag: t.keyword, color: "white" },
          { tag: t.name, color: "pink" },
          {
            tag: [t.deleted, t.character, t.propertyName, t.macroName],
            color: "white",
          },
          { tag: [t.function(t.variableName), t.labelName], color: "white" },
          {
            tag: [t.color, t.constant(t.name), t.standard(t.name)],
            color: "#ff0",
          },
          { tag: [t.definition(t.name), t.separator], color: "white" },
        ])
      ),
      syntaxHighlighting(oneDarkHighlightStyle, { fallback: true }),
      autocompletion(
        {
          override: [autocompleteOptions],
          closeOnBlur: false,
        } /*as CompletionConfig*/
      ),
      closeBrackets(),
      highlightSelectionMatches(),
      //@ts-ignore
      keymap.of([
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...searchKeymap,
        ...historyKeymap,
        ...foldKeymap,
        ...completionKeymap,
        ...lintKeymap,
        ...commentKeymap,
        // ...evalKeymap
        ...hydraKeymaps,
      ]),
      EditorView.theme(JSON.parse(JSON.stringify(themeObject))),
      oneDark,
      //  linter(esLint(new Linter()))
      // solarizedDark
    ];
  }
}
export default HydraEditorConfiguration;
