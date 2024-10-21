import type { I18n } from "./index.ts";
import type { RecursiveRecord } from "./loaders/base.ts";

export class Language {
	constructor(
		public lang: string,
		private data: RecursiveRecord,
		private fallback?: I18n,
	) {}

	/**
	 * Set the fallback language for this language if the key is not found in this language.
	 */
	public setFallback(fallback: I18n): void {
		this.fallback = fallback;
	}

	private getValue(key: string, fallback = false): RecursiveRecord {
		const keys = key.split(".");
		let current = this.data;

		for (const key of keys) {
			if (!current[key]) {
				if (this.fallback && !fallback) {
					return this.fallback.getLanguage(this.fallback.defaultLang)
						.getValue(key, true);
				}

				if (fallback) {
					throw new Error(
						`Key ${key} does not exist in ${this.lang} or its fallback ${this.fallback?.defaultLang}`,
					);
				} else {
					throw new Error(
						`Key ${key} does not exist in ${this.lang}`,
					);
				}
			}

			current = current[key] as RecursiveRecord;
		}

		return current;
	}

	public get(key: string): RecursiveRecord {
		return this.getValue(key);
	}

	public has(key: string): boolean {
		return this.getValue(key) != undefined;
	}

	public set(key: string, value: RecursiveRecord): void {
		const keys = key.split(".");
		let current = this.data;

		for (let i = 0; i < keys.length - 1; i++) {
			if (!current[keys[i]]) {
				current[keys[i]] = {};
			}

			current = current[keys[i]] as RecursiveRecord;
		}

		current[keys[keys.length - 1]] = value;
	}

	public delete(key: string): boolean {
		const keys = key.split(".");
		let current = this.data;

		for (let i = 0; i < keys.length - 1; i++) {
			if (!current[keys[i]]) {
				return false;
			}

			current = current[keys[i]] as RecursiveRecord;
		}

		return delete current[keys[keys.length - 1]];
	}
}
