import { Command, CommandContext, Embed } from "harmony";
import { doPermCheck, queues } from "queue";
import { PlayerLoop } from "lavadeno";

export default class QueueLoop extends Command {
	override name = "queueloop";
	override aliases = ["replayqueue", "qloop", "ql"];
	override category = "music";
	override description = "Loop the current queue";

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
				const previousLoopType = queue.player.loop.toString();
				const isLoopDisabled = queue.player.loop != PlayerLoop.QUEUE;

				if (isLoopDisabled) {
					queue.player.setLoop(PlayerLoop.QUEUE);
				} else {
					queue.player.setLoop(PlayerLoop.OFF);
				}

				await ctx.message.reply({
					embeds: [
						new Embed({
							author: {
								name: "Bidome bot",
								icon_url: ctx.client.user!.avatarURL(),
							},
							title: "Toggled song loop",
							description: `Queue looping is now ${
								previousLoopType == "queue"
									? "Disabled"
									: "Enabled"
							} ${
								previousLoopType != "off" &&
									previousLoopType != "queue"
									? `and track looping is now disabled`
									: ""
							}`,
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
							title: "Unable to toggle queue loop",
							description:
								"You are missing the `ADMINISTRATOR` permission and you are not alone in the channel!",
						}).setColor("red"),
					],
				});
			}
		}
	}
}
