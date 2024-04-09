import * as Comlink from "comlink";

type WorkerCallback<W extends Worker, T> = (worker: Comlink.Remote<W>) => Promise<T>;
type WorkerConstructor<T extends Worker> = { new (): T };

export async function runWorkerCtx<W extends Worker, T>(
	workerConstructor: WorkerConstructor<W>,
	callback: WorkerCallback<W, T>
): Promise<T> {
	const proxy = Comlink.wrap(new workerConstructor()) as Comlink.Remote<W>;

	try {
		return await callback(proxy);
	} finally {
		proxy[Comlink.releaseProxy]();
	}
}
