import type { FC } from "react";
import { useRef, useEffect } from "react";
// editor
import { EditorState } from "@codemirror/state";
import { EditorView, keymap, lineNumbers } from "@codemirror/view";
import { defaultKeymap } from "@codemirror/commands";



const Editor: FC = () => {
	const editorRef = useRef(null);

	useEffect(() => {
		const customTheme = EditorView.theme({
			"&.cm-focused": {
				outline: "none",
			},
			".cm-gutters": {
				"background-color": "transparent",
				"border-right": "none",
				color: "#fff",
			},
		});
		const startState = EditorState.create({
			doc: "",
			extensions: [keymap.of(defaultKeymap), lineNumbers(), customTheme],
		});

		const view = new EditorView({
			state: startState,
			parent: editorRef?.current || undefined,
		});
		return () => {
			view.destroy();
		};
	}, []);

	return <div ref={editorRef} />;
};

export default Editor;
