import { Command, CommandContext, Embed } from "harmony";
import { doPermCheck, queues } from "queue";
import { PlayerLoop } from "lavadeno";

export default class Skip extends Command {
	override name = "skip";
	override aliases = ["s"];
	override category = "music";
	override description = "Vote to skip the queue";

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
			const doesUserNeedToBeAdded = !queue.voteSkipUsers.includes(
				ctx.author.id,
			);

			if (doesUserNeedToBeAdded) {
				queue.voteSkipUsers.push(ctx.author.id);
			}

			const canVoteSkip = queue.canSkip(
				(await botState.channel.voiceStates.array()).filter((s) =>
					!s.user.bot
				),
			);

			if (canVoteSkip) {
				if (queue.player.queue.size == 0) {
					queue.deleteQueue();
				} else {
					const currentLoopState = queue.player.loop;
					queue.player.setLoop(PlayerLoop.OFF);
					// Skip for some reason ends the queue - This is a super jank workaround
					await queue.player.skip();
					queue.player.setLoop(currentLoopState);
				}

				await ctx.message.reply({
					embeds: [
						new Embed({
							author: {
								name: "Bidome bot",
								icon_url: ctx.client.user!.avatarURL(),
							},
							title: "Skipped",
							description:
								"Enough users have voted so the song has been skipped!",
						}).setColor("green"),
					],
				});
			} else {
				const voiceMembers = (
					await botState.channel.voiceStates.array()
				).filter((s) => !s.user.bot);
				const skippingUsers = [];

				for (const member of voiceMembers) {
					if (queue.voteSkipUsers.includes(member.user.id)) {
						skippingUsers.push(member.user.id);
					}
				}

				if (doesUserNeedToBeAdded) {
					await ctx.message.reply({
						embeds: [
							new Embed({
								author: {
									name: "Bidome bot",
									icon_url: ctx.client.user!.avatarURL(),
								},
								title: "Voted to skip",
								description:
									`You have voted to skip the song! ${skippingUsers.length}/${
										Math.floor(voiceMembers.length / 2) + 1
									}`,
								footer: {
									text: (await doPermCheck(
											ctx.member!,
											botState.channel,
										)) ||
											queue.player.current!.requestedBy as unknown as string ==
												ctx.author.id
										? "Use forceskip to skip without a vote"
										: "",
								},
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
								title: "Already voted to skip",
								description:
									`You have already voted to skip the song! ${skippingUsers.length}/${
										Math.floor(voiceMembers.length / 2) + 1
									}`,
								footer: {
									text: (await doPermCheck(
											ctx.member!,
											botState.channel,
										))
										? "Use forceskip to skip without a vote"
										: "",
								},
							}).setColor("red"),
						],
					});
				}
			}
		}
	}
}
