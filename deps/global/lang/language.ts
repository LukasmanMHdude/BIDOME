import { parse } from "$std/yaml/mod.ts";
import { getLocale, type RecursiveRecord } from "./index.ts";

export const tokenizeFiles = (
	langFiles: { name: string; content: RecursiveRecord }[]
) => {
	const tokenizedLangFiles: { key: string; value: string | string[] }[] = [];

	for (const file of langFiles) {
		const recursiveTokenize = (record: RecursiveRecord, prefix = "") => {
			for (const [key, value] of Object.entries(record)) {
				if (typeof value === "object") {
					recursiveTokenize(value as RecursiveRecord, `${prefix}${key}.`);
				} else {
					tokenizedLangFiles.push({
						key: `${prefix}${key}`,
						value,
					});
				}
			}
		};

		let prefix = "";

		for (const segment of file.name
			.substring(2, file.name.length - ".yml".length)
			.split("/")) {
			if (!segment.startsWith("_")) {
				prefix += `${segment}.`;
			}
		}

		recursiveTokenize(file.content, prefix);
	}

	return tokenizedLangFiles;
};

const generateTypes = async (keys: string[]) => {
	const keysList = new Set<string>();

	for (const key of keys) {
		const trimToken = (token: string) => {
			const tokenSplit = token.split(".");

			if (tokenSplit.length != 0 && tokenSplit[0] != "") {
				keysList.add(tokenSplit.join("."));

				trimToken(tokenSplit.slice(0, -1).join("."));
			}
		};

		keysList.add(key);
		trimToken(key);
	}

	let code = `export type LangKeys =\n`;

	for (const key of Array.from(keysList).sort()) {
		code += `\t| "${key}"\n`;
	}

	code = `${code.substring(0, code.length - 1)};\n`;

	await Deno.writeTextFile("./deps/global/lang/types/_keys.ts", code);
};

export class Language {
	private keys: RecursiveRecord = {};
	private internalKeyCount = 0;
	private _en: Language | undefined;

	public get keyCount() {
		// I would use something like Object.keys to generate it on the fly but that would require
		// Crawling the entire object so it's better to just keep track of it as a number - Bloxs
		return this.internalKeyCount;
	}

	public get completionAmount(): number {
		this._en = this._en ?? getLocale("en-US");

		if (this._en == undefined) throw new Error("en-US language not found");

		return this.keyCount / this._en.keyCount;
	}

	constructor(
		public readonly locale: string,
		public readonly englishName: string,
		public readonly nativeName: string,
		langFiles: { name: string; content: string }[]
	) {
		// I'm aware I'm converting this from yaml into json into strings just to reconvert it back into json
		// but it's much easier to do it this way as then I don't need to deal with as many name collisions - Bloxs

		const parsedLangFiles: { name: string; content: RecursiveRecord }[] = [];

		for (const file of langFiles) {
			try {
				parsedLangFiles.push({
					name: file.name,
					content: parse(file.content) as RecursiveRecord,
				});
			} catch {
				console.error(`Error parsing ${file.name} for ${locale}`);
			}
		}

		const tokenizedLangFiles = tokenizeFiles(parsedLangFiles);

		if (
			locale === "en-US" &&
			Deno.args.map((a) => a.toLowerCase()).includes("--generate-types")
		) {
			generateTypes(tokenizedLangFiles.map((file) => file.key));
		}

		for (const { key, value } of tokenizedLangFiles) {
			this.addKey(key, value);
		}
	}

	public addKey(key: string, value: string | string[], record = this.keys) {
		this.internalKeyCount++;
		const [nextKey, ...rest] = key.split(".");

		if (rest.length === 0) {
			record[nextKey] = value;
			return;
		} else {
			record[nextKey] ??= {};

			this.addKey(rest.join("."), value, record[nextKey] as RecursiveRecord);
		}
	}

	public deleteKey(key: string, record = this.keys): boolean {
		const [nextKey, ...rest] = key.split(".");

		if (rest.length === 0) {
			const success = delete record[nextKey];
			if (success) this.internalKeyCount--;
			return success;
		} else {
			return this.deleteKey(rest.join("."), record[nextKey] as RecursiveRecord);
		}
	}

	public getKey(
		key: string,
		record = this.keys
	): string | string[] | RecursiveRecord | RecursiveRecord[] {
		const [nextKey, ...rest] = key.split(".");

		if (rest.length === 0) {
			const res = record[nextKey];

			if (res == undefined && this.locale != "en-US") {
				this._en = this._en ?? getLocale("en-US");

				if (this._en == undefined) throw new Error("en-US language not found");

				return this._en.getKey(key);
			} else {
				return res;
			}
		} else {
			return this.getKey(rest.join("."), record[nextKey] as RecursiveRecord);
		}
	}
}
