import type { FC } from "react";
import { useRef, useEffect } from "react";
// editor
import { EditorState } from "@codemirror/state";
import { EditorView, keymap, lineNumbers } from "@codemirror/view";
import { defaultKeymap, insertNewline } from "@codemirror/commands";
import { syntaxHighlighting } from "@codemirror/language";
import { customLanguage, customHighlightStyle } from "./highlight";

interface EditorProps {
	doc: string;
	onChange?: (doc: string) => void;
}

// https://codemirror.net/docs/ref/#commands.insertNewlineAndIndent
const customKeymap = keymap.of([
	{ key: "Enter", run: insertNewline },
	...defaultKeymap,
]);

const Editor: FC<EditorProps> = ({ doc, onChange }) => {
	const editorRef = useRef(null);

	useEffect(() => {
		const customTheme = EditorView.theme({
			"&": {
				color: "#fff",
			},
			".cm-content": {
				"caret-color": "#fff",
			},
			"&.cm-focused": {
				outline: "none",
			},
			".cm-gutters": {
				"background-color": "transparent",
				"border-right": "none",
				color: "#ddd",
			},
		});
		const startState = EditorState.create({
			doc: doc,
			extensions: [
				customKeymap,
				lineNumbers(),
				customTheme,
				customLanguage,
				syntaxHighlighting(customHighlightStyle),
			],
		});

		const view = new EditorView({
			state: startState,
			parent: editorRef?.current || undefined,
		});
		return () => {
			view.destroy();
		};
	}, [doc]);

	return <div ref={editorRef} />;
};

export default Editor;
