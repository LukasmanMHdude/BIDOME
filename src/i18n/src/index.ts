import type { RecursiveRecord } from "./loaders/base.ts";
import { Language } from "./language.ts";

export * from "./language.ts";

export class I18n {
	private hasLoaded: boolean = false;
	private languages = new Map<string, Language>();

	constructor(public defaultLang: string) {}

	public load(langInfo: Map<string, RecursiveRecord>): I18n {
		for (const [lang, data] of langInfo) {
			if (this.languages.has(lang)) {
				console.warn(`Language ${lang} already exists, overwriting`);
			}

			this.languages.set(lang, new Language(lang, data, this));
		}

		this.hasLoaded = true;
		return this;
	}

	public addLanguage(lang: string, data: RecursiveRecord | Language): I18n {
		if (this.languages.has(lang)) {
			console.warn(`Language ${lang} already exists, overwriting`);
		}

		if (data instanceof Language) {
			this.languages.set(lang, data);
		} else {
			this.languages.set(lang, new Language(lang, data, this));
		}

		this.hasLoaded = true;
		return this;
	}

	public removeLanguage(lang: string): boolean {
		return this.languages.delete(lang);
	}

	public hasLanguage(lang: string): boolean {
		return this.languages.has(lang);
	}

	public getLanguage(lang: string): Language {
		if (!this.hasLoaded) {
			throw new Error("I18n has not been loaded yet");
		}

		const langData = this.languages.get(lang) ??
			this.languages.get(this.defaultLang);

		if (!langData) {
			throw new Error(
				`Language ${lang} and ${this.defaultLang} does not exist`,
			);
		}

		return langData;
	}
}
