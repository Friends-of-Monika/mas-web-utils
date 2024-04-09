import { type Remote } from "comlink";

import WebPythonWorker from "./python.worker?worker";
import PythonWorker from "./python.worker";
import { runWorkerCtx } from "./worker";

export type AntlrToken = { type: number; start: number; stop: number };
export type SimpleToken = { type: number; token: string };

export async function tokenize(source: string): Promise<SimpleToken[]> {
	return runWorkerCtx(WebPythonWorker, async (worker: Remote<unknown>): Promise<SimpleToken[]> => {
		const tokens = await (worker as Remote<PythonWorker>).tokenize(source);
		return tokens.map((it) => ({ type: it.type, token: source.substring(it.start, it.stop + 1) }));
	});
}
