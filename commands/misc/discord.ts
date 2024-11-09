import { Command, CommandContext, Embed } from "harmony";

export default class Discord extends Command {
	override name = "discord";
	override category = "misc";
	override description = "Get a link to bidome's discord";
	override usage = "Discord";
	override async execute(ctx: CommandContext) {
		await ctx.message.reply(undefined, {
			embeds: [
				new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.client.user!.avatarURL(),
					},
					description:
						"Bidome's support and general chat is located inside of [Wave Studios](https://discord.gg/yrwUpMcfcR)",
				}).setColor("random"),
			],
		});
	}
}
