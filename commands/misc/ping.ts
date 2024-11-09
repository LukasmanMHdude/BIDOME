import { Command, CommandContext, Embed } from "harmony";

export default class Ping extends Command {
	override name = "ping";
	override category = "misc";
	override description = "Get the bot's ping";
	override usage = "Ping";
	override async execute(ctx: CommandContext) {
		const now = new Date();
		const message = await ctx.message.reply(undefined, {
			embeds: [
				new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.message.client.user!.avatarURL(),
					},
					title: "Bidome ping",
					description: "Collecting ping! Please wait",
				}).setColor("random"),
			],
		});
		const edited = new Date();
		await message.edit({
			embeds: [
				new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.message.client.user!.avatarURL(),
					},
					title: "Bidome ping",
					fields: [
						{
							name: "Ping values",
							value: "Websocket: `" +
								ctx.message.client.gateway.ping +
								"` \nPing: `" +
								(now.getTime() -
									ctx.message.timestamp.getTime()) +
								"` \nEdit: `" +
								(edited.getTime() - now.getTime()) +
								"`",
						},
					],
				}).setColor("random"),
			],
		});
	}
}
