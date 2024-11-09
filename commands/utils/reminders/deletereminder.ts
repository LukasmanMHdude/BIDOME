import { Command, CommandContext, Embed } from "harmony";
import { getReminders, removeReminder } from "settings";
import { createEmbedFromLangData, getString, getUserLanguage } from "i18n";

export default class DeleteReminder extends Command {
	override name = "deletereminder";
	override aliases = [
		"deletereminders",

		"delreminder",
		"delreminders",

		"rmreminder",
		"rmreminders",
		"removereminder",
		"removereminders",

		"cancelreminder",
		"cancelreminders",
	];
	override category = "utils";
	override description = "Delete a reminder";
	override async execute(ctx: CommandContext) {
		const lang = await getUserLanguage(ctx.author);
		if (ctx.argString == "") {
			await ctx.message.reply(undefined, {
				embeds: [
					new Embed({
						...createEmbedFromLangData(
							lang,
							"commands.deletereminder.error.noargs",
						),
						author: {
							name: "Bidome bot",
							icon_url: ctx.client.user!.avatarURL(),
						},
					}).setColor("random"),
				],
			});
		} else {
			const reminders = await getReminders();
			const reminderIds = ctx.argString
				.split(/[ ,]/g)
				.map((s) => (s.startsWith("#") ? s.slice(1) : s));
			if (reminderIds.length > 1) {
				const canceledReminders: string[] = [];

				for (const id of reminderIds) {
					const reminder = reminders.find((r) =>
						r.id!.toString() == id
					);
					if (reminder == undefined) continue;
					if (reminder.user_id != ctx.author.id) continue;
					await removeReminder(reminder.id.toString());
					canceledReminders.push(id);
				}

				await ctx.message.reply(undefined, {
					embeds: [
						new Embed({
							author: {
								name: "Bidome bot",
								icon_url: ctx.client.user!.avatarURL(),
							},
							title: getString(
								lang,
								"commands.deletereminder.successBulk.title",
								`${canceledReminders.length}/${reminderIds.length}`,
							),
							description: reminderIds
								.map((id) =>
									getString(
										lang,
										`commands.deletereminder.successBulk.${
											canceledReminders.includes(id)
												? "success"
												: "failure"
										}`,
										`#${id}`,
									)
								)
								.join("\n"),
						}).setColor("random"),
					],
				});
			} else {
				const reminder = reminders.find(
					(r) => r.id.toString() == ctx.argString,
				);
				if (reminder == undefined) {
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
						await removeReminder(reminder.id);
						await ctx.message.reply(undefined, {
							embeds: [
								new Embed({
									...createEmbedFromLangData(
										lang,
										"commands.deletereminder.success",
										`#${reminder.id}`,
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
			}
		}
	}
}
