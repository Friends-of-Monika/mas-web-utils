import * as Comlink from "comlink";

// @ts-expect-error because package is built with untyped JS
import { Python3Parser } from "dt-python-parser";
import { type AntlrToken } from "./python";

export default class PythonWorker {
	public tokenize(source: string): AntlrToken[] {
		const parser = new Python3Parser();
		const tokens = parser.getAllTokens(source);
		// Need to simplify tokens to exclude circular dependencies and allow serialization
		return tokens.map((it: AntlrToken) => ({ type: it.type, start: it.start, stop: it.stop }));
	}
}

Comlink.expose(new PythonWorker());
