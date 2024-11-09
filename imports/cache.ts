try {
	await Deno.mkdir("./.cache");
} catch {
	// ignore
}

try {
	const json = JSON.parse(await Deno.readTextFile("./.cache/data.json"));
	if (json.dataVersion !== 2) {
		console.log("Cache is on an invalid version, resetting cache");
		await Deno.remove("./.cache", { recursive: true });
		await Deno.mkdir("./.cache");
		throw new Error("Invalid cache version");
	}
} catch {
	await Deno.writeTextFile(
		"./.cache/data.json",
		JSON.stringify({
			dataVersion: 2,
			userData: {},
			guildMemberData: {},
		}),
	);
}

interface newCache {
	dataVersion: 2;
	userData: {
		[user: string]: {
			avatarHash?: string;
			bannerHash?: string;
		};
	};
	guildMemberData: {
		[guild: string]: {
			[user: string]: {
				avatarHash?: string;
				bannerHash?: string;
			};
		};
	};
}

const newCache: newCache = JSON.parse(
	await Deno.readTextFile("./.cache/data.json"),
);

export const getDiscordImage = async (url: string) => {
	const typeMap = {
		avatars: "avatarHash",
		banners: "bannerHash",
		icons: "avatarHash",
	};
	const newRoute = (
		url.includes("?") ? url.substring(0, url.lastIndexOf("?")) : url
	).substring("https://cdn.discordapp.com/".length);
	const [type] = newRoute.split("/");

	if (type == "attachments") {
		throw new Error("Attachments are not supported currently");
	}

	if (type == "guilds") {
		const [_, guildId, __, userId, imageType, hash] = newRoute.split("/");
		newCache.guildMemberData[guildId] ??= {};
		newCache.guildMemberData[guildId][userId] ??= {};
		const currentValue = newCache.guildMemberData[guildId][userId][
			typeMap[imageType as "avatars" | "banners" | "icons"] as
				| "avatarHash"
				| "bannerHash"
		] as string;
		if (currentValue != undefined && currentValue == hash) {
			return await Deno.readFile(
				`./.cache/${guildId}/${userId}/${imageType}/${hash}`,
			);
		} else {
			if (currentValue != undefined) {
				await Deno.remove(
					`./.cache/${guildId}/${userId}/${imageType}/${currentValue}`,
				);
			}
			const image = await (await fetch(url)).arrayBuffer();
			await Deno.mkdir(`./.cache/${guildId}/${userId}/${imageType}`, {
				recursive: true,
			});
			await Deno.writeFile(
				`./.cache/${guildId}/${userId}/${imageType}/${hash}`,
				new Uint8Array(image),
			);
			newCache.guildMemberData[guildId][userId][
				typeMap[imageType as "avatars" | "banners" | "icons"] as
					| "avatarHash"
					| "bannerHash"
			] = hash;
			await Deno.writeTextFile(
				"./.cache/data.json",
				JSON.stringify(newCache),
			);
			return new Uint8Array(image);
		}
	} else {
		const [_, id, hash] = newRoute.split("/");
		newCache.userData[id] ??= {};

		const currentValue = newCache.userData[id]?.[
			typeMap[type as "avatars" | "banners" | "icons"] as
				| "avatarHash"
				| "bannerHash"
		] as string;
		if (currentValue != undefined && currentValue == hash) {
			return await Deno.readFile(`./.cache/${id}/${type}/${hash}`);
		} else {
			if (currentValue != undefined) {
				await Deno.remove(`./.cache/${id}/${type}/${currentValue}`);
			}
			const image = await (await fetch(url)).arrayBuffer();
			await Deno.mkdir(`./.cache/${id}/${type}`, { recursive: true });
			await Deno.writeFile(
				`./.cache/${id}/${type}/${hash}`,
				new Uint8Array(image),
			);

			newCache.userData[id]![
				typeMap[type as "avatars" | "banners" | "icons"] as
					| "avatarHash"
					| "bannerHash"
			] = hash;
			await Deno.writeTextFile(
				"./.cache/data.json",
				JSON.stringify(newCache),
			);
			return new Uint8Array(image);
		}
	}
};
