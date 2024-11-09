import { Command, CommandContext, Embed } from "harmony";
import { getReminders } from "settings";
import { createEmbedFromLangData, getString, getUserLanguage } from "i18n";
import { toMs } from "tools";

export default class ListReminders extends Command {
	override name = "listreminders";
	override aliases = ["reminders"];
	override category = "utils";
	override description = "List your reminders";

	override async execute(ctx: CommandContext) {
		const lang = await getUserLanguage(ctx.author);
		const reminders = await getReminders(ctx.author.id);
		if (reminders.length == 0) {
			await ctx.message.reply(undefined, {
				embeds: [
					new Embed({
						...createEmbedFromLangData(
							lang,
							"commands.listreminders.noreminders",
						),
						author: {
							name: "Bidome bot",
							icon_url: ctx.client.user!.avatarURL(),
						},
					}),
				],
			});
		} else {
			if (ctx.argString != "") {
				const reminder = reminders.find(
					(r) => r.id?.toString() == ctx.argString,
				);
				if (reminder == undefined) {
					// Peak laziness
					await ctx.message.reply(undefined, {
						embeds: [
							new Embed({
								...createEmbedFromLangData(
									lang,
									"commands.deletereminder.error.invalid",
								),
								author: {
									name: "Bidome bot",
									icon_url: ctx.client.user!.avatarURL(),
								},
							}).setColor("random"),
						],
					});
				} else {
					if (reminder.user_id != ctx.author.id) {
						// More peak laziness
						await ctx.message.reply(undefined, {
							embeds: [
								new Embed({
									...createEmbedFromLangData(
										lang,
										"commands.deletereminder.error.notyours",
									),
									author: {
										name: "Bidome bot",
										icon_url: ctx.client.user!.avatarURL(),
									},
								}).setColor("random"),
							],
						});
					} else {
						const remindersMap = [
							reminder.remind_at,
							...(reminder.future_sends ?? []).map(
								(t: string) =>
									new Date(reminder.created_at!).getTime() +
									toMs(t),
							),
						]
							.slice(0, 5)
							.map((t) =>
								`<t:${
									(new Date(t).getTime() / 1000).toFixed(0)
								}:R>`
							);
						const nonParsed = [
							reminder.remind_at,
							...(reminder.future_sends ?? []),
						];

						if (remindersMap.length < nonParsed.length) {
							remindersMap.push(
								`\`+${
									nonParsed.length - remindersMap.length
								}\``,
							);
						}

						await ctx.message.reply(undefined, {
							embeds: [
								new Embed({
									...createEmbedFromLangData(
										lang,
										"commands.listreminders.info",
										`#${reminder.id}`,
										remindersMap.join("\n"),
										`<t:${
											(
												new Date(reminder.created_at!)
													.getTime() / 1000
											).toFixed(0)
										}:R>`,
										reminder.reminder,
									),
									author: {
										name: "Bidome bot",
										icon_url: ctx.client.user!.avatarURL(),
									},
								}).setColor("random"),
							],
						});
					}
				}
			} else {
				await ctx.message.reply(undefined, {
					embeds: [
						new Embed({
							author: {
								name: "Bidome bot",
								icon_url: ctx.client.user!.avatarURL(),
							},
							title: getString(
								lang,
								"commands.listreminders.reminders.title",
							),
							description: getString(
								lang,
								"commands.listreminders.reminders.description",
							),
							fields: reminders.map((reminder) => ({
								name: getString(
									lang,
									"commands.listreminders.reminders.field.name",
									`#${reminder.id}`,
								),
								value: getString(
									lang,
									"commands.listreminders.reminders.field.value",
									`<t:${
										(new Date(reminder.remind_at)
											.getTime() / 1000).toFixed(
												0,
											)
									}:R>`,
									`https://discord.com/channels/${reminder.server_id}/${reminder.channel_id}/${reminder.message_id}`,
									reminder.reminder,
									reminder.future_sends != undefined &&
										reminder.future_sends.length > 0
										? `\`+${reminder.future_sends.length}\` `
										: "",
								),
								inline: true,
							})),
						}).setColor("random"),
					],
				});
			}
		}
	}
}
