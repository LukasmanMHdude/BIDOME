import { LoaderBase, type RecursiveRecord } from "./base.ts";
import { readFile } from "node:fs/promises";
import { getAllFilesRecursively } from "@studios/utils/fs";
import { parse } from "@std/yaml/parse";

export class YamlLoader extends LoaderBase {
	constructor(protected override basePath: string) {
		if (basePath.endsWith("/")) {
			basePath = basePath.slice(0, -1);
		}
		super(basePath);
	}

	public override async load(): Promise<Map<string, RecursiveRecord>> {
		const allFiles = await getAllFilesRecursively(this.basePath);
		const languages = new Map<string, RecursiveRecord>();

		for (const file of allFiles) {
			const filePath = file.substring(this.basePath.length + 1);
			const [lang, ...rest] = filePath.split("/");
			const baseObject: RecursiveRecord = languages.get(lang) ?? {};

			let parsed: RecursiveRecord;

			try {
				parsed = parse(
					await readFile(file, "utf8"),
				) as RecursiveRecord;
			} catch (e) {
				console.error(`Failed to parse ${file}: ${e}`);
				continue;
			}

			let localizedBaseObject: RecursiveRecord = baseObject;

			// Ignore _'s in path (ie _lang.yaml)
			for (let key of rest.filter((k) => !k.startsWith("_"))) {
				if (key.endsWith(".yaml")) {
					key = key.slice(0, -5);
				}

				if (key === "") {
					continue;
				}

				localizedBaseObject[key] ??= {};
				localizedBaseObject =
					localizedBaseObject[key] as RecursiveRecord;
			}

			Object.assign(localizedBaseObject, parsed);

			languages.set(lang, baseObject);
		}

		return languages;
	}
}
