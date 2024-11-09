import { Command, CommandContext, Embed } from "harmony";

export default class Status extends Command {
	override name = "status";
	override category = "misc";
	override description = "Suggest statuses to be added to the bot";
	override usage = "Status";
	override async execute(ctx: CommandContext) {
		await ctx.message.reply(undefined, {
			embeds: [
				new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.client.user!.avatarURL(),
					},
					description:
						"You can suggest statuses on our [**Github**](https://github.com/quick007/BIDOME)",
				}).setColor("random"),
			],
		});
	}
}
