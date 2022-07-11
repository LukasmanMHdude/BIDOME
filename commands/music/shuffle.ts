import { Command, CommandContext, Embed } from "harmony";
import { queues, doPermCheck } from "queue";
import { shuffleArray } from "tools";

export default class Shuffle extends Command {
	name = "shuffle";
	// Dankpods reference
	aliases = ["mix", "shu-fle"];
	category = "music";
	description = "Shuffle the queue";

	async execute(ctx: CommandContext) {
		if (ctx.guild == undefined) return;
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
			const queue = queues.get(ctx.guild!.id)!;
			const states = await ctx.guild!.voiceStates.get(ctx.author.id);
			if (await doPermCheck(ctx.member!, states!.channel!)) {
				const nowPlaying = queue.queue[0];
				const toMixSongs = queue.queue.slice(1);

				queue.queue = [nowPlaying, ...shuffleArray(toMixSongs)];

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
