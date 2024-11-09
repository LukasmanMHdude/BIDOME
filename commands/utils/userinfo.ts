import {
	Command,
	CommandContext,
	Embed,
	GuildBan,
	Member,
	User,
	UserFlags,
} from "harmony";
import { createEmbedFromLangData, getEmote, getUserLanguage } from "i18n";
import { format } from "tools";
import { getDiscordImage } from "cache";
import { Image } from "imagescript";

export const getBadges = (
	flags: (keyof typeof UserFlags)[],
	badges: string[] = [],
): string => {
	if (flags.length == 0) {
		return badges.filter((b) => b.trim() != "").join(" ");
	}
	const badge = flags[0];
	const badgeEmotes: { [key in keyof typeof UserFlags]: string } = {
		DISCORD_EMPLOYEE: getEmote("staff"),
		PARTNERED_SERVER_OWNER: getEmote("partner"),
		HYPESQUAD_EVENTS: getEmote("hypesquadevent"),
		BUGHUNTER_LEVEL_1: getEmote("bughunter"),
		BUGHUNTER_LEVEL_2: getEmote("bughunter"),
		HOUSE_BRAVERY: getEmote("bravery"),
		HOUSE_BRILLIANCE: getEmote("brilliance"),
		HOUSE_BALANCE: getEmote("balance"),
		EARLY_SUPPORTER: getEmote("earlysupporter"),
		EARLY_VERIFIED_DEVELOPER: getEmote("verifiedbotdev"),
		// If certified mod comes back this is prob gonna be renamed
		DISCORD_CERTIFIED_MODERATOR: getEmote("certifiedmodalumni"),
		// No emotes for these atm
		TEAM_USER: "",
		SYSTEM: "",
		VERIFIED_BOT: "",
		BOT_HTTP_INTERACTIONS: "",
	};

	if (badgeEmotes[badge] != undefined) {
		badges.push(badgeEmotes[badge]);
	}

	flags = flags.filter((f) => f != badge);

	return getBadges(flags, badges);
};

export default class UserInfo extends Command {
	override name = "userinfo";
	override aliases = ["ui"];
	override description = "Get information about a user";
	override category = "utils";
	override usage = "userinfo [user]";

	override async execute(ctx: CommandContext) {
		const userId = ctx.argString != ""
			? /<@!?[0-9]{17,19}>/.test(ctx.argString.trim())
				? ctx.argString.replace(/<@!?([0-9]{17,19})>/, "$1")
				: ctx.argString
			: ctx.member!.id;

		let member: Member | undefined;
		let user: User | undefined;

		try {
			member = await ctx.guild!.members.resolve(userId);
			if (member == undefined || member.user.username == undefined) {
				member = await ctx.guild!.members.fetch(userId);
			}
		} catch {
			member = undefined;
		}

		try {
			user = await ctx.client.users.resolve(userId);
			if (user == undefined || user.username == undefined) {
				user = await ctx.client.users.fetch(userId);
			}
		} catch {
			user = undefined;
		}

		const lang = await getUserLanguage(ctx.author.id);

		if (user == undefined && member == undefined) {
			await ctx.message.reply(
				new Embed({
					...createEmbedFromLangData(
						lang,
						"commands.userinfo.notfound",
					),
					author: {
						name: "Bidome bot",
						icon_url: ctx.client.user!.avatarURL(),
					},
				}).setColor("red"),
			);
		} else {
			let banInfo: GuildBan | undefined = undefined;

			try {
				banInfo = await ctx.guild!.bans.get(userId);
			} catch {
				// Not banned
			}

			const userAvatarURL = user?.avatarURL() ?? member?.user.avatarURL();
			let embedColor = "random";

			if (userAvatarURL != undefined) {
				const avatar = await Image.decode(
					await getDiscordImage(userAvatarURL),
				);

				const avgColor = avatar.averageColor();

				embedColor = `#${avgColor.toString(16).substring(0, 6)}`;
			}

			if (member != undefined) {
				user = user!;

				const userBadges = getBadges([
					...(member.user.publicFlags != undefined
						? member.user.publicFlags.toArray()
						: []),
					...(user.flags != undefined ? user.flags.toArray() : []),
				] as (keyof typeof UserFlags)[]);

				const presence = await ctx.guild!.presences.resolve(member.id);
				await ctx.message.reply(
					new Embed({
						...createEmbedFromLangData(
							lang,
							"commands.userinfo.memberinfo",
							`${
								banInfo != undefined
									? `${getEmote("banhammer")} `
									: ""
							}${member.user.tag}${
								member.nick != undefined
									? ` (${member.nick})`
									: ""
							} ${
								userBadges.trim() != ""
									? ` ${userBadges}`
									: ""
							}`,
							`<@!${member.id}>`,
							`<t:${
								(new Date(member.timestamp).getTime() / 1000)
									.toFixed(
										0,
									)
							}:F>`,
							`<t:${
								(new Date(member.joinedAt).getTime() / 1000)
									.toFixed(
										0,
									)
							}:F>`,
							format(
								presence?.clientStatus.desktop ??
									presence?.clientStatus.mobile ??
									presence?.clientStatus.web ??
									"offline",
							),
							await member.roles.size(),
							(await member.roles.array())
								.slice(0, 46)
								.map((r) => `<@&${r.id}>`)
								.join(", ") +
								((await member.roles.array()).sort((r1, r2) => {
										return r1.name.localeCompare(r2.name);
									}).length > 46
									? "..."
									: ""),
						),
						author: {
							name: "Bidome bot",
							icon_url: ctx.client.user!.avatarURL(),
						},
						thumbnail: {
							url: member.user.avatarURL()!,
						},
					}).setColor(embedColor),
				);
			} else {
				// Make ts know it's not undefined
				user = user!;
				const userBadges = getBadges([
					...(user.flags != undefined ? user.flags.toArray() : []),
				] as (keyof typeof UserFlags)[]);

				await ctx.message.reply(
					new Embed({
						...createEmbedFromLangData(
							lang,
							"commands.userinfo.userinfo",
							`${
								banInfo != undefined
									? `${getEmote("banhammer")} `
									: ""
							}${user.tag}${
								userBadges.trim() != "" ? ` ${userBadges}` : ""
							}`,
							`<@!${user.id}>`,
							`<t:${
								(new Date(user.timestamp).getTime() / 1000)
									.toFixed(0)
							}:F>`,
						),
						author: {
							name: "Bidome bot",
							icon_url: ctx.client.user!.avatarURL(),
						},
						thumbnail: {
							url: user.avatarURL()!,
						},
					}).setColor(embedColor),
				);
			}
		}
	}
}
