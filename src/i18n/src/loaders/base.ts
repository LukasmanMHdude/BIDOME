export interface RecursiveRecord {
	[key: string]: RecursiveRecord | string | string[];
}

export class LoaderBase {
	constructor(protected basePath: string) {}
	// deno-lint-ignore require-await
	public async load(): Promise<Map<string, RecursiveRecord>> {
		return new Map();
	}
}
