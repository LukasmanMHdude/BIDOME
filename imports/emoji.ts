import {
	activity,
	flags,
	food,
	nature,
	objects,
	people,
	symbols,
	travel,
} from "https://deno.land/x/discord_emoji@v2.4.0/mod.ts";

type EmojiKeys =
	| keyof typeof activity
	| keyof typeof flags
	| keyof typeof food
	| keyof typeof nature
	| keyof typeof objects
	| keyof typeof people
	| keyof typeof symbols
	| keyof typeof travel;

export const emoji = (name: EmojiKeys) => {
	for (
		const emojiJson of [
			activity,
			flags,
			food,
			nature,
			objects,
			people,
			symbols,
			travel,
		]
	) {
		// @ts-ignore Typings
		if (emojiJson[name]) return emojiJson[name];
	}
	return undefined;
};

// TODO: Migrate commands to new emoji system

import { emojiData } from "https://deno.land/x/getmoji@1.2.4/emojiData.ts";
// Modified from getmoji/mod.ts

const filterEmoji = (emojiName: string) => {
	return emojiData.filter((data) => data.name === emojiName);
};

export const getEmojiByName = (name: string) => {
	const filteredData = filterEmoji(name);
	return filteredData.length ? filteredData[0].char : "emoji not found";
};
