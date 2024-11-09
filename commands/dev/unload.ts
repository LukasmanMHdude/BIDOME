import { Command, CommandContext, Embed } from "harmony";

export default class Unload extends Command {
	override name = "unload";
	override aliases = ["unloadcommand", "unloadcmd"];
	override description = "Unload a specific command";
	override category = "dev";
	override usage = "unload <command>";
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
						title: "Bidome Reload",
						description: "You need to provide a command!",
					}).setColor("red"),
				],
			});
		} else {
			const command = ctx.client.commands.find(ctx.argString);
			if (command == undefined) {
				await ctx.message.reply(undefined, {
					embeds: [
						new Embed({
							author: {
								name: "Bidome bot",
								icon_url: ctx.message.client.user!.avatarURL(),
							},
							title: "Bidome Reload",
							description: "Unknown command!",
						}).setColor("red"),
					],
				});
			} else {
				ctx.client.commands.list.delete(`${command.name}-0`);

				await ctx.message.reply(undefined, {
					embeds: [
						new Embed({
							author: {
								name: "Bidome bot",
								icon_url: ctx.message.client.user!.avatarURL(),
							},
							title: "Bidome Reload",
							description: "Unloaded command!",
						}).setColor("random"),
					],
				});
			}
		}
	}
}
