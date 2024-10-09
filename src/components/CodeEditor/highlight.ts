import { StreamLanguage } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import type { StreamParser, StringStream } from "@codemirror/language";
import { HighlightStyle } from "@codemirror/language";

interface CustomParserState {
	lineStart: boolean;
	hasSpace: boolean;
}

const customParser: StreamParser<CustomParserState> = {
	token(stream: StringStream, state: CustomParserState): string | null {
		if (stream.sol()) {
			state.lineStart = true;
			state.hasSpace = false;
		}

		if (state.lineStart && stream.eat("#")) {
			stream.skipToEnd();
			return "comment";
		}

		if (state.lineStart) {
			if (stream.match(/^\S+/)) {
				const restOfLine = stream.string.slice(stream.pos);
				if (!restOfLine.trim()) {
					stream.skipToEnd();
					return "invalid";
				}
				state.lineStart = false;
				return "variableName";
			}
		}

		if (!state.hasSpace && stream.eat(/\s/)) {
			state.hasSpace = true;
		}

		if (state.hasSpace) {
			if (stream.eol()) {
				return "invalid";
			}
			stream.skipToEnd();
			return "content";
		}

		stream.next();
		return null;
	},
	startState(): CustomParserState {
		return { lineStart: true, hasSpace: false };
	},
};

export const customLanguage =
	StreamLanguage.define<CustomParserState>(customParser);

export const customHighlightStyle = HighlightStyle.define([
	{ tag: t.comment, color: "green" },
	{ tag: t.variableName, color: "blue" },
	{ tag: t.content, color: "white" },
	{ tag: t.invalid, color: "red" },
]);
