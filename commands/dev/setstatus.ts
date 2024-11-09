import {
	Command,
	CommandContext,
	Embed,
	isMessageComponentInteraction,
} from "harmony";
import { format } from "tools";

export default class SetStatus extends Command {
	override name = "setstatus";
	override ownerOnly = true;
	override category = "dev";
	override description = "Change the bot's status";
	override usage = "Setstatus <status>";
	override async execute(ctx: CommandContext) {
		if (ctx.argString === "") {
			await ctx.message.reply(undefined, {
				embeds: [
					new Embed({
						author: {
							name: "Bidome bot",
							icon_url: ctx.message.client.user!.avatarURL(),
						},
						title: "Bot status",
						description: "Please provide a status to change it to!",
					}).setColor("random"),
				],
			});
		} else {
			const now = Date.now();
			const message = await ctx.message.reply(undefined, {
				embeds: [
					new Embed({
						author: {
							name: "Bidome bot",
							icon_url: ctx.message.client.user!.avatarURL(),
						},
						title: "Bot status",
						description: "Please select the status type!",
						footer: {
							text: "This will time out in 30 seconds!",
						},
					}).setColor("random"),
				],
				components: [
					{
						type: 1,
						components: [
							"PLAYING",
							"WATCHING",
							"LISTENING",
							"COMPETING",
							"CUSTOM",
						].map((status) => ({
							type: 2,
							label: format(status),
							style: "BLURPLE",
							customID: `${status.toLowerCase()}-${now}`,
						})),
					},
				],
			});

			const choice = await ctx.client.waitFor(
				"interactionCreate",
				(i) =>
					isMessageComponentInteraction(i) &&
					i.customID.endsWith(`-${now}`) &&
					i.user.id === ctx.author.id,
				30 * 1000,
			);
			if (!choice[0]) {
				await message.edit(undefined, {
					embeds: [
						new Embed({
							author: {
								name: "Bidome bot",
								icon_url: ctx.message.client.user!.avatarURL(),
							},
							title: "Bot status",
							description: "Status change timed out!",
						}).setColor("random"),
					],
					components: [],
				});
				return;
			} else {
				if (!isMessageComponentInteraction(choice[0])) return;
				const statusMap = {
					PLAYING: 0,
					LISTENING: 2,
					WATCHING: 3,
					CUSTOM: 4,
					COMPETING: 5,
				};
				const type = choice[0].customID.split("-")[0].toUpperCase() as
					| "PLAYING"
					| "WATCHING"
					| "LISTENING"
					| "COMPETING"
					| "CUSTOM";

				const presence = {
					type: statusMap[type],
					name: ctx.argString,
					status: ctx.client.presence.status,
					...(type == "CUSTOM"
						? {
							state: ctx.argString,
						}
						: {}),
				};

				ctx.client.setPresence(presence);
				await message.edit(undefined, {
					embeds: [
						new Embed({
							author: {
								name: "Bidome bot",
								icon_url: ctx.message.client.user!.avatarURL(),
							},
							title: "Bot status",
							description: "Status has been changed!",
						}).setColor("random"),
					],
					components: [],
				});
			}
		}
	}
}
