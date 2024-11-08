import { Command, CommandContext, Embed } from "harmony";
import { doPermCheck, queues } from "queue";
import { formatMs, toMs } from "tools";

export default class Seek extends Command {
	name = "seek";
	aliases = ["skipto"];
	category = "music";
	description = "Seek to a specific time in the song";

	async execute(ctx: CommandContext) {
		if (ctx.guild == undefined) return;
		const queue = queues.get(ctx.guild.id);
		const botState = await ctx.guild!.voiceStates.get(ctx.client.user!.id);
		if (
			queue == undefined || botState == undefined ||
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
				const position = toMs(ctx.argString);

				if (ctx.argString == "" || isNaN(position)) {
					await ctx.message.reply({
						embeds: [
							new Embed({
								author: {
									name: "Bidome bot",
									icon_url: ctx.client.user!.avatarURL(),
								},
								title: "Invalid argument",
								description:
									"Please provide a valid timestamp such as `4h` or `1d`",
							}).setColor("red"),
						],
					});
				} else {
					queue.player.seek(position);
					queue.player.current.position = position;

					if (queue.queueMessage != undefined) {
						queue.queueMessage.edit(queue.nowPlayingMessage);
					}

					await ctx.message.reply({
						embeds: [
							new Embed({
								author: {
									name: "Bidome bot",
									icon_url: ctx.client.user!.avatarURL(),
								},
								title: "Changed player position",
								description:
									`The player's position has been moved to \`${
										formatMs(
											position,
										)
									}\``,
							}).setColor("green"),
						],
					});
				}
			} else {
				await ctx.message.reply({
					embeds: [
						new Embed({
							author: {
								name: "Bidome bot",
								icon_url: ctx.client.user!.avatarURL(),
							},
							title: "Unable to seek",
							description:
								"You are missing the `ADMINISTRATOR` permission and you are not alone in the channel!",
						}).setColor("red"),
					],
				});
			}
		}
	}
}
