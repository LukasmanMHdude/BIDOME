import { Command, CommandContext, Embed } from "harmony";
import { toMs, truncateString } from "tools";
import { createEmbedFromLangData, getUserLanguage } from "i18n";
import { createReminder, getReminders } from "settings";

export default class RemindMe extends Command {
	override name = "remindme";
	override aliases = ["createreminder"];
	override category = "utils";
	override description = "Create a reminder";
	override async execute(ctx: CommandContext) {
		const lang = await getUserLanguage(ctx.author);
		const reminders = await getReminders(ctx.author.id);

		if (reminders.length >= 10) {
			await ctx.message.reply(undefined, {
				embeds: [
					new Embed({
						...createEmbedFromLangData(
							lang,
							"commands.createreminder.error.toomany",
						),
						author: {
							name: "Bidome bot",
							icon_url: ctx.client.user!.avatarURL(),
						},
					}),
				],
			});
		} else {
			if (ctx.argString == "") {
				await ctx.message.reply(undefined, {
					embeds: [
						new Embed({
							...createEmbedFromLangData(
								lang,
								"commands.createreminder.error.noargs",
							),
							author: {
								name: "Bidome bot",
								icon_url: ctx.client.user!.avatarURL(),
							},
						}),
					],
				});
			} else {
				const [timestamp, ...messageSplit] = ctx.argString.split(" ");
				const message = messageSplit.join(" ");
				if (message == "") {
					await ctx.message.reply(undefined, {
						embeds: [
							new Embed({
								...createEmbedFromLangData(
									lang,
									"commands.createreminder.error.nomessage",
								),
								author: {
									name: "Bidome bot",
									icon_url: ctx.client.user!.avatarURL(),
								},
							}),
						],
					});
				} else {
					const [base, ...parsedTimestamps] = timestamp
						.split(",")
						.sort((a, b) => toMs(a) - toMs(b));
					const baseParsed = toMs(base);

					for (const ms of [base, ...parsedTimestamps]) {
						const msParsed = toMs(ms);
						if (isNaN(msParsed)) {
							return await ctx.message.reply(undefined, {
								embeds: [
									new Embed({
										...createEmbedFromLangData(
											lang,
											"commands.createreminder.error.invalidtime",
										),
										author: {
											name: "Bidome bot",
											icon_url: ctx.client.user!
												.avatarURL(),
										},
									}),
								],
							});
						}
					}

					const id = await createReminder({
						remind_at: new Date(Date.now() + baseParsed)
							.toUTCString(),
						user_id: ctx.author.id,
						message_id: ctx.message.id,
						channel_id: ctx.channel.id,
						server_id: ctx.guild!.id,
						reminder: truncateString(message, 100),
						future_sends: parsedTimestamps,
					});

					const time = (
						new Date().getTime() / 1000 +
						baseParsed / 1000
					).toFixed(0);

					await ctx.message.reply(undefined, {
						embeds: [
							new Embed({
								...createEmbedFromLangData(
									lang,
									"commands.createreminder.success",
									`#${id}`,
									`<t:${time}:R>`,
									truncateString(message, 100),
								),
								author: {
									name: "Bidome bot",
									icon_url: ctx.client.user!.avatarURL(),
								},
							}),
						],
					});
				}
			}
		}
	}
}
