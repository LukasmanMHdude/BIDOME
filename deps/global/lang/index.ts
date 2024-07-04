import { Language } from "./language.ts";
import { parse } from "$std/yaml/mod.ts";
import type { _Lang } from "./types/_lang.ts";
import type { LangKeys } from "./types/_keys.ts";

// For some reason doing this as a `type` has an error - Bloxs
export interface RecursiveRecord {
	[key: string]: RecursiveRecord | string | string[] | RecursiveRecord[];
}

const languages = new Map<string, Language>();

for await (const lang of Deno.readDir("./lang/")) {
	if (!lang.isDirectory) continue;

	const files: { name: string; content: string }[] = [];

	const langFile = parse(
		await Deno.readTextFile(`./lang/${lang.name}/_lang.yml`)
	) as {
		_lang: _Lang;
	};

	const recursiveFetch = async (path: string) => {
		for await (const file of Deno.readDir(path)) {
			if (file.isDirectory) {
				await recursiveFetch(`${path}/${file.name}`);
			} else {
				files.push({
					name: `.${path.substring(`./lang/${lang.name}`.length)}/${file.name}`,
					content: await Deno.readTextFile(`${path}/${file.name}`),
				});
			}
		}
	};

	await recursiveFetch(`./lang/${lang.name}`);

	const language = new Language(
		langFile._lang.locale,
		langFile._lang["en-name"],
		langFile._lang.name,
		files
	);

	languages.set(lang.name, language);
}

export const getLocale = (locale: string) => {
	return languages.get(locale);
};

type ValidArgs = string | number | boolean;

const replaceArgs = (str: string, ...args: ValidArgs[]): string => {
	return str.replace(/{[0-9]{1,}(:[a-z]{1,})?}/g, (str) => {
		const index = parseInt(
			str.substring(1, str.includes(":") ? str.indexOf(":") : str.length - 1)
		);

		if (args[index] == undefined) return str;

		// TODO: Implement custom tags - Bloxs

		return args[index].toString();
	});
};

export const getString = (
	locale: string,
	key: LangKeys,
	...args: ValidArgs[]
): string => {
	const language = getLocale(locale) ?? getLocale("en-US");

	if (language == undefined) throw new Error("Language not found");

	const keyStr = language.getKey(key);

	if (keyStr == undefined) {
		if (locale != "en-US") return getString("en-US", key, ...args);
		return `Key ${key} not found`;
	}

	if (typeof keyStr != "string") throw new Error("Key is not a string");

	return replaceArgs(keyStr as string, ...args);
};

export const getObject = (
	locale: string,
	key: LangKeys,
	...args: ValidArgs[]
): RecursiveRecord => {
	const language = getLocale(locale) ?? getLocale("en-US");

	if (language == undefined) throw new Error("Language not found");

	const keyStr = language.getKey(key);

	const recursiveReplace = (obj: RecursiveRecord) => {
		for (const key in obj) {
			if (typeof obj[key] == "string") {
				obj[key] = replaceArgs(obj[key] as string, ...args);
			} else if (Array.isArray(obj[key])) {
				if ((obj[key] as string[]).every((str) => typeof str == "string")) {
					obj[key] = (obj[key] as string[]).map((str) =>
						replaceArgs(str, ...args)
					);
					continue;
				}

				// TODO: Do variables based on the items in the array - Bloxs
			} else {
				recursiveReplace(obj[key] as RecursiveRecord);
			}
		}
	};

	recursiveReplace(keyStr as RecursiveRecord);

	return keyStr as RecursiveRecord;
};

console.log(getObject("en-US", "_lang", "test"));
