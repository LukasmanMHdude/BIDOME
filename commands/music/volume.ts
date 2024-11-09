import { Command, CommandContext, Embed } from "harmony";
import { doPermCheck, queues } from "queue";

export default class Volume extends Command {
	override name = "volume";
	override aliases = ["vol"];
	override category = "music";
	override description = "Change the volume of the player";

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
				if (
					ctx.argString == "" ||
					isNaN(parseInt(ctx.argString)) ||
					parseInt(ctx.argString) < 1
				) {
					await ctx.message.reply({
						embeds: [
							new Embed({
								author: {
									name: "Bidome bot",
									icon_url: ctx.client.user!.avatarURL(),
								},
								title: "Invalid argument",
								description:
									"Please select a value larger than 0",
							}).setColor("red"),
						],
					});
				} else {
					const volume = parseInt(ctx.argString);
					queue.volume = volume;
					queue.player.setVolume(volume);
					await ctx.message.reply({
						embeds: [
							new Embed({
								author: {
									name: "Bidome bot",
									icon_url: ctx.client.user!.avatarURL(),
								},
								title: "Changed volume",
								description: `Volume set to ${volume}`,
								footer: {
									text: volume > 100
										? "Audio may be distorted at volumes above 100"
										: "",
								},
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
							title: "Unable to change volume",
							description:
								"You are missing the `ADMINISTRATOR` permission and you are not alone in the channel!",
						}).setColor("red"),
					],
				});
			}
		}
	}
}
