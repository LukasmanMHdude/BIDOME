import {
	activity,
	flags,
	food,
	nature,
	objects,
	people,
	symbols,
	travel,
} from "https://deno.land/x/discord_emoji@v2.5.1/mod.ts";

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
