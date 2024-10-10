import type { FC } from "react";
import { useRef, useEffect, useCallback } from "react";
// ipc
import { invoke } from "@tauri-apps/api/core";
import { COMMAND, type GroupDetail } from "@/lib/ipc";
// editor
import { EditorState } from "@codemirror/state";
import { EditorView, keymap, lineNumbers } from "@codemirror/view";
import { syntaxHighlighting } from "@codemirror/language";
import { customLanguage, customHighlightStyle } from "./highlight";
import {
	defaultKeymap,
	insertNewline,
	historyKeymap,
	history,
} from "@codemirror/commands";

interface EditorProps {
	id: number;
	onChange?: (doc: string) => void;
}

// https://codemirror.net/docs/ref/#commands.insertNewlineAndIndent
const customKeymap = keymap.of([
	{ key: "Enter", run: insertNewline },
	...defaultKeymap,
	...historyKeymap,
]);

const Editor: FC<EditorProps> = ({ id }) => {
	const editorRef = useRef<HTMLDivElement>(null);
	const viewRef = useRef<EditorView | null>(null);

	const getGroupDetailById = useCallback(async (id: number) => {
		try {
			const groupDetail: GroupDetail = await invoke(COMMAND.READ_GROUP, { id });
			console.log("[DEBUG] read group detail success", groupDetail);
			const transaction = viewRef.current?.state.update({
				changes: { from: 0, insert: groupDetail.content },
			});
			transaction && viewRef.current?.dispatch(transaction);
		} catch (error) {
			console.log("[DEBUG] read group detail failed", error);
		}
	}, []);

	useEffect(() => {
		const customTheme = EditorView.theme({
			"&": {
				color: "#fff",
				"font-weight": 600,
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
			doc: "",
			extensions: [
				customKeymap,
				lineNumbers(),
				history(),
				customTheme,
				customLanguage,
				syntaxHighlighting(customHighlightStyle),
			],
		});

		const view = new EditorView({
			state: startState,
			parent: editorRef?.current || undefined,
		});

		viewRef.current = view;

		return () => {
			view.destroy();
		};
	}, []);

	useEffect(() => {
		getGroupDetailById(id);
	}, [id, getGroupDetailById]);

	return <div ref={editorRef} />;
};

export default Editor;
