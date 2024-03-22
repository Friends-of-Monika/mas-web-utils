export function readTextFile(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = (e) => resolve(e.target!.result as string);
		reader.onabort = (e) => reject(e);
		reader.onerror = (e) => reject(e);
		reader.readAsText(file);
	});
}

export function openFilePickerDialog(accept: string, callback: (file: File) => void) {
	const input = document.createElement("input");

	input.type = "file";
	input.accept = accept;
	input.addEventListener("change", (e: Event) => {
		callback((e.target as HTMLInputElement).files![0]);
	});

	input.click();
}
