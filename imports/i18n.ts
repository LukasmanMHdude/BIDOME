import { Embed, EmbedPayload, Guild, Member, User } from "./harmony.ts";
import { loopFilesAndReturn } from "./tools.ts";
import { parse } from "jsr:@std/yaml";

interface RecursiveRecord {
	[key: string]: string | string[] | RecursiveRecord;
}

type ValidEmojis =
	| "nitro"
	| "earlysupporter"
	| "boost1m"
	| "boost2m"
	| "boost3m"
	| "boost6m"
	| "boost9m"
	| "boost12m"
	| "boost15m"
	| "boost18m"
	| "boost24m"
	| "bravery"
	| "balance"
	| "brilliance"
	| "hypesquadevent"
	| "staff"
	| "serverowner"
	| "partner"
	| "verifiedbotdev"
	| "certifiedmod"
	| "bughunter"
	| "bughunter2"
	| "typing"
	| "check"
	| "cross"
	| "activedev"
	| "certifiedmodalumni"
	| "banhammer"
	| "error";

const logFunction = console.log;

console.log = (...args: unknown[]) => {
	const date = new Date();
	const amOrPm = date.getHours() > 12 ? "PM" : "AM";
	const hours = amOrPm == "AM" ? date.getHours() : date.getHours() - 12;

	const logPrefix =
		`[${date.getMonth()}/${date.getDate()}/${date.getFullYear()} ${hours}:${
			date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()
		}${amOrPm}]`;

	if (self.postMessage != undefined) {
		self.postMessage({
			type: "log",
			prefix: logPrefix,
			data: args,
		});
	}

	logFunction(...[logPrefix, ...args]);
};

interface Language {
	language: {
		short: string;
		full: string;
	};
}

const languages: Record<string, Language> = {};
const emotes: Record<string, string> = parse(
	await Deno.readTextFile("./lang/emotes.yml"),
) as Record<string, string>;

for (let langFile of await loopFilesAndReturn("./lang/", [".json", ".jsonc"])) {
	langFile = langFile.split("#")[0];
	if (/[a-z]{2}\.json/.test(langFile)) {
		const fileContents = (await Deno.readTextFile(langFile)).replace(
			/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g,
			(m, g) => (g ? "" : m),
		);

		let fileData: Language;
		try {
			fileData = JSON.parse(fileContents);
		} catch {
			console.log(`[i18n] Failed to parse ${langFile}! Skipping...`);
			continue;
		}

		if (fileData == undefined) continue;
		const langCode = fileData.language.short;
		languages[langCode] = fileData;
		console.log(
			`[i18n] Loaded language ${fileData.language.short}-${fileData.language.full}`,
		);
	}
}

console.log(`[i18n] Loaded ${Object.keys(languages).length} languages!`);

export function getString(
	lang: string,
	key: string,
	...data: unknown[]
): string {
	const langData = languages[lang] ?? languages["en"];

	const getStringFromJson = (
		key: string,
		currentObject = langData,
	): string | string[] => {
		const [next, ...rest] = key.split(".");
		if (rest.length == 0) {
			// @ts-expect-error it should work
			return JSON.parse(JSON.stringify(currentObject[next]));
		} else {
			// @ts-expect-error it should work
			const futureObject = currentObject[next];
			if (futureObject == undefined) {
				if (lang != "en") {
					return getString("en", key, ...data);
				}
				return `Invalid language key: ${key}`;
			}
			return getStringFromJson(rest.join("."), futureObject);
		}
	};

	let fetchedString = getStringFromJson(key);

	if (typeof fetchedString != "string") {
		fetchedString = fetchedString.join("\n");
	}

	if (data.length > 0) {
		for (let i = 0; i < data.length; i++) {
			fetchedString = fetchedString.replace(`{${i}}`, `${data[i]}`);
		}
	}

	for (const [emote, emoteString] of Object.entries(emotes)) {
		fetchedString = fetchedString.replace(`{e:${emote}}`, emoteString);
	}

	return fetchedString;
}

export async function getUserLanguage(
	_user: User | Member | string,
): Promise<string> {
	return await "en";
}

export async function getGuildLanguage(
	_guild: Guild | string,
): Promise<string> {
	return await "en";
}

export function getLanguage(lang: string): Language {
	return languages[lang] ?? languages["en"];
}

export function getAllLanguageData(): Record<string, Language> {
	return languages;
}

export function getLanguageList(): string[] {
	return Object.keys(languages);
}

export function createEmbedFromLangData(
	lang: string,
	path: string,
	...data: unknown[]
) {
	const langData = languages[lang] ?? languages["en"];

	const grabData = (
		path: string,
		currentObject = langData,
	): RecursiveRecord => {
		const [next, ...rest] = path.split(".");
		// @ts-expect-error it should work
		const object = currentObject[next];
		if (rest.length == 0) {
			return JSON.parse(JSON.stringify(object));
		} else {
			return grabData(rest.join("."), object);
		}
	};

	const applyVariables = (
		embed: RecursiveRecord,
		data: unknown[],
	): RecursiveRecord => {
		const isJson = (str: string) => {
			const res = JSON.parse(JSON.stringify(str));
			return typeof res == "object";
		};

		for (const [key] of Object.entries(embed)) {
			if (
				typeof embed[key] == "object" && !(embed[key] instanceof Array)
			) {
				return applyVariables(
					embed[key] as Record<string, string>,
					data,
				);
			} else {
				if (embed[key] instanceof Array) {
					if (isJson((embed[key] as string[])[0])) {
						for (
							const field of embed[key] as unknown as Record<
								string,
								string
							>[]
						) {
							for (const [fieldKey] of Object.entries(field)) {
								for (let i = 0; i < data.length; i++) {
									if (typeof field[fieldKey] != "string") {
										continue;
									}
									field[fieldKey] = field[fieldKey].replace(
										`{${i}}`,
										`${data[i]}`,
									);
									for (
										const [emote, emoteString] of Object
											.entries(emotes)
									) {
										field[fieldKey] = field[fieldKey]
											.replace(
												`{e:${emote}}`,
												emoteString,
											);
									}
								}
							}
						}
					} else {
						embed[key] = (embed[key] as string[]).join("\n");
					}
				}
				if (typeof embed[key] != "string") continue;
				for (let i = 0; i < data.length; i++) {
					embed[key] = (embed[key] as string).replace(
						`{${i}}`,
						`${data[i]}`,
					);
					for (const [emote, emoteString] of Object.entries(emotes)) {
						embed[key] = (embed[key] as string).replace(
							`{e:${emote}}`,
							emoteString,
						);
					}
				}
			}
		}
		return embed;
	};

	const embedData = grabData(path);
	const embedWithVariables = applyVariables(embedData, data);

	return new Embed({
		...(embedWithVariables as EmbedPayload),
	})
		.setColor("random")
		.toJSON();
}

export const getEmote = (emote: ValidEmojis) => emotes[emote];
