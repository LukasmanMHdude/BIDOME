import { Command, CommandContext, Embed } from "harmony";
import { doPermCheck, queues } from "queue";

export default class Shuffle extends Command {
	override name = "shuffle";
	// Dankpods reference
	override aliases = ["mix", "shu-fle"];
	override category = "music";
	override description = "Shuffle the queue";

	override async execute(ctx: CommandContext) {
		if (ctx.guild == undefined) return;
		const queue = queues.get(ctx.guild.id);
		const botState = await ctx.guild!.voiceStates.get(ctx.client.user!.id);
		if (
			queue == undefined ||
			botState == undefined ||
			botState.channel == undefined
		) {
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

			if (queue != undefined) {
				queue.deleteQueue();
			}
		} else {
			const queue = queues.get(ctx.guild!.id)!;
			if (await doPermCheck(ctx.member!, botState.channel)) {
				queue.player.queue.shuffle();

				await ctx.message.reply({
					embeds: [
						new Embed({
							author: {
								name: "Bidome bot",
								icon_url: ctx.client.user!.avatarURL(),
							},
							title: "Shuffled queue!",
							description: "I have shuffled the queue!",
						}).setColor("green"),
					],
				});
			} else {
				await ctx.message.reply({
					embeds: [
						new Embed({
							author: {
								name: "Bidome bot",
								icon_url: ctx.client.user!.avatarURL(),
							},
							title: "Unable to shuffle",
							description:
								"You are missing the `ADMINISTRATOR` permission (being alone also works)",
						}).setColor("red"),
					],
				});
			}
		}
	}
}
