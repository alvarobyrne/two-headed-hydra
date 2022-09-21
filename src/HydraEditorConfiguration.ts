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
import hydraKeys from "./hydra-environment/keymaps.js";
import { getLine, getBlock } from "./evalKeymaps";

class HydraEditorConfiguration {
  constructor() {}
  getConfiguration(autocompleteOptions: CompletionSource): Extension {
    const hydraKeymaps = Object.entries(hydraKeys).map(([key, val]) => ({
      key: key,
      run: (opts) => {
        console.log("called", val, opts);
        let text = "";
        if (val === "editor:evalLine") {
          text = getLine(opts);
        } else if (val === "editor:evalBlock") {
          text = getBlock(opts);
        }
        console.log("text", text);
        self.emit(val, text);
      },
    }));
    //@ts-ignore
    const keymapOf = keymap.of([
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
    ]);
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
      EditorView.theme({
        "&": {
          backgroundColor: "transparent",
          fontSize: "16px",
          color: "white",
          fontFamily: `'Roboto Mono', monospace`,
        },
        "& .cm-scroller": {
          fontFamily: `'Roboto Mono', monospace`,
        },
        "& .cm-line": {
          maxWidth: "fit-content",
          // background: 'hsla(50,23%,5%,0.6)',
          background: "rgba(0, 0, 0, 0.7)",
        },
        "& .ͼo": {
          color: "white",
        },
        "& .cm-tooltip.cm-tooltip-autocomplete > ul": {
          minWidth: "80px",
          fontFamily: `'Roboto Mono', monospace`,
        },
        "&.cm-focused": {
          outline: "none",
        },
        "& .cm-tooltip": {
          background: `rgba(0, 0, 0, 0.5)`,
          // color: '#abb2bf'
        },
        "& .cm-tooltip-autocomplete > ul > li[aria-selected]": {
          color: "white",
          // color: '#abb2bf',
          backgroundColor: "rgba(0, 0, 0, 0.7)",
        },
        ".cm-completionInfo": {
          // fontFamily: 'monospace',
          fontFamily: `'Roboto Mono', monospace`,
          fontStyle: "italic",
          // color: '#abb2bf',
          padding: "1.5px 9px",
        },
        ".cm-completionIcon": {
          width: "4px",
          height: "10px",
          opacity: 1,
          paddingRight: "0px",
          marginRight: "6px",
        },
        ".cm-completionIcon-src": {
          backgroundColor: "orange",
        },
        ".cm-completionIcon-coord": {
          backgroundColor: "yellow",
        },
        ".cm-completionIcon-color": {
          backgroundColor: "lightgreen",
        },
        ".cm-completionIcon-combine": {
          backgroundColor: "lightblue",
        },
        ".cm-completionIcon-combineCoord": {
          backgroundColor: "purple",
        },
        ".cm-completionIcon-src:after": {
          content: "ƒ",
        },
        // // adds word wrapping
        // '.cm-content': {
        //   whiteSpace: 'pre-wrap'
        // }
      }),
      oneDark,
      //  linter(esLint(new Linter()))
      // solarizedDark
    ];
  }
}
export default HydraEditorConfiguration;
