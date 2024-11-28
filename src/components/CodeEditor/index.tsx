import type { FC } from "react";
import { useRef, useEffect, useMemo } from "react";
// ipc
import { invoke } from "@tauri-apps/api/core";
import { COMMAND, type GroupDetail } from "@/lib/ipc";
// editor
import { EditorState, StateEffect } from "@codemirror/state";
import { EditorView, keymap, lineNumbers } from "@codemirror/view";
import { syntaxHighlighting } from "@codemirror/language";
import { customLanguage, customHighlightStyle } from "./highlight";
import {
	defaultKeymap,
	insertNewline,
	historyKeymap,
	history,
	toggleLineComment,
} from "@codemirror/commands";

import { useToast } from "@/hooks/use-toast";
import { useDebounceFn } from "ahooks";

interface EditorProps {
	id: number;
	onChange?: (doc: string) => void;
}

// https://codemirror.net/docs/ref/#commands.insertNewlineAndIndent
const customKeymap = keymap.of([
	{ key: "Enter", run: insertNewline },
	{ key: "Mod-/", run: toggleLineComment },
	...defaultKeymap,
	...historyKeymap,
]);

const Editor: FC<EditorProps> = ({ id }) => {
	const editorRef = useRef<HTMLDivElement>(null);
	const viewRef = useRef<EditorView | null>(null);

	const { toast } = useToast();

	const handleUpdateContent = (doc: string) => {
		const view = viewRef.current;
		const transaction = view?.state.update({
			changes: {
				from: 0,
				to: view.state.doc.length,
				insert: doc,
			},
			effects: StateEffect.appendConfig.of(EditorView.editable.of(id !== 0)),
		});
		if (transaction && view) {
			view.dispatch(transaction);
			if (id !== 0) {
				const endPosition = view.state.doc.length;
				view.dispatch({
					selection: { anchor: endPosition, head: endPosition },
					scrollIntoView: true,
				});
				view.focus();
			}
		}
	};

	const getGroupDetailById = async (id: number) => {
		try {
			const groupDetail: GroupDetail = await invoke(COMMAND.READ_GROUP_DETAIL, {
				id,
			});
			console.log("[DEBUG] read group detail success", groupDetail);
			handleUpdateContent(groupDetail.content);
			console.log(
				"[debug] dispatch after",
				viewRef.current?.state.toJSON().doc,
			);
		} catch (error) {
			handleUpdateContent("");
			toast({
				description: "read failed",
				variant: "destructive",
			});
			console.log("[DEBUG] read group detail failed", error);
		}
	};

	const handleUpdateGroup = async (notify = true) => {
		try {
			const content = viewRef.current?.state.toJSON().doc;
			await invoke(COMMAND.UPDATE_GROUP_CONTENT, { id, content });
			if (!notify) return;
			toast({
				description: "save success",
				variant: "success",
			});
		} catch (error) {
			console.log("[debug] error", error);
			toast({
				description: "save failed",
				variant: "destructive",
			});
		}
	};

	const { run: debounceUpdateGroup } = useDebounceFn(handleUpdateGroup, {
		wait: 300,
	});

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const saveKeymap = useMemo(() => {
		return keymap.of([
			{
				key: "Mod-s",
				run: () => {
					debounceUpdateGroup();
					return true;
				},
			},
		]);
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
				saveKeymap,
				lineNumbers(),
				history(),
				customTheme,
				customLanguage,
				syntaxHighlighting(customHighlightStyle),
				EditorView.editable.of(id !== 0),
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
	}, [saveKeymap, id]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		getGroupDetailById(id);
	}, [id]);

	return <div ref={editorRef} onBlur={() => handleUpdateGroup(false)} />;
};

export default Editor;
