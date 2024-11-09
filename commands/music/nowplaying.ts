import { Command, CommandContext, Embed } from "harmony";
import { queues } from "queue";

export default class Queue extends Command {
	override name = "nowplaying";
	override aliases = ["np", "playing"];
	override category = "music";
	override description = "View the current song";

	override async execute(ctx: CommandContext) {
		if (ctx.guild == undefined) return;
		const botState = await ctx.guild!.voiceStates.get(ctx.client.user!.id);
		if (
			queues.has(ctx.guild!.id) &&
			(botState == undefined || botState.channel == undefined)
		) {
			queues.get(ctx.guild!.id)!.deleteQueue();
		}

		const queue = queues.get(ctx.guild.id);
		if (queue == undefined) {
			await ctx.message.reply(undefined, {
				embeds: [
					new Embed({
						author: {
							name: "Bidome bot",
							icon_url: ctx.client.user!.avatarURL(),
						},
						title: "Not currently playing!",
						description: "I am not currently playing anything!",
					}).setColor("red"),
				],
			});
		} else {
			await ctx.message.reply(undefined, queue.nowPlayingMessage);
		}
	}
}
