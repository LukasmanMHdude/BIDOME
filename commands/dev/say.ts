import { Command, CommandContext, Embed } from "harmony";

export default class Say extends Command {
	override name = "say";
	override aliases = ["echo"];
	override description = "Make the bot say something";
	override category = "dev";
	override usage = "Say <message>";
	override ownerOnly = true;
	override async execute(ctx: CommandContext) {
		if (ctx.argString === "") {
			await ctx.message.reply(undefined, {
				embeds: [
					new Embed({
						author: {
							name: "Bidome bot",
							icon_url: ctx.message.client.user!.avatarURL(),
						},
						title: "Bidome say",
						description: `You need to provide a message`,
					}).setColor("random"),
				],
			});
		} else {
			await ctx.channel.send(ctx.argString);
		}
	}
}
