import { Command, CommandContext, Embed } from "harmony";
import { formatMs } from "tools";

export default class Uptime extends Command {
	override name = "uptime";
	override category = "misc";
	override description = "See bot uptime!";
	override async execute(ctx: CommandContext) {
		await ctx.message.reply(undefined, {
			embeds: [
				new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.client.user!.avatarURL(),
					},
					title: "Bot uptime",
					description: `Bidome has been online for \`${
						formatMs(
							ctx.client.uptime,
							true,
						)
					}\``,
				}).setColor("random"),
			],
		});
	}
}
