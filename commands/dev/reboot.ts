import { Command, CommandContext, Embed } from "harmony";
import { getEmote } from "i18n";

export default class Reboot extends Command {
	override name = "reboot";
	override aliases = ["restart"];
	override category = "dev";
	override description = "Restarts the bot";
	override usage = "reboot";
	override ownerOnly = true;

	override async execute(ctx: CommandContext) {
		await ctx.message.reply(undefined, {
			embeds: [
				new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.client.user!.avatarURL(),
					},
					description: `Restarting bot ${getEmote("typing")}`,
				}).setColor("random"),
			],
		});

		if (self.postMessage != undefined) {
			self.postMessage({ type: "exit" });
		} else {
			Deno.exit(0);
		}
	}
}
