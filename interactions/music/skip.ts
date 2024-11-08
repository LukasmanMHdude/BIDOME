import { Embed, MessageComponentInteraction } from "harmony";
import { doPermCheck, queues } from "queue";

export async function button(i: MessageComponentInteraction) {
	if (i.customID == "skip-song") {
		const botState = await i.guild!.voiceStates.get(i.client.user!.id);
		if (
			!queues.has(i.guild!.id) ||
			botState == undefined ||
			botState.channel == undefined
		) {
			await i.respond({
				ephemeral: true,
				embeds: [
					new Embed({
						author: {
							name: "Bidome bot",
							icon_url: i.client.user!.avatarURL(),
						},
						title: "Not currently playing!",
						description: "I am not currently playing anything!",
					}).setColor("red"),
				],
			});

			if (queues.get(i.guild!.id) != undefined) {
				queues.get(i.guild!.id)!.deleteQueue();
			}
		} else {
			const queue = queues.get(i.guild!.id)!;
			const doesUserNeedToBeAdded = !queue.voteSkipUsers.includes(
				i.user.id,
			);

			if (doesUserNeedToBeAdded) {
				queue.voteSkipUsers.push(i.user.id);
			}

			const canVoteSkip = queue.canSkip(
				(await botState.channel.voiceStates.array()).filter((s) =>
					!s.user.bot
				),
			);

			if (canVoteSkip) {
				queue.player.skip();

				await i.respond({
					embeds: [
						new Embed({
							author: {
								name: "Bidome bot",
								icon_url: i.client.user!.avatarURL(),
							},
							title: "Skipped",
							description:
								"Enough users have voted so the song has been skipped!",
							footer: {
								icon_url: i.user.avatarURL(),
								text: `Skipped by ${i.user.tag}`,
							},
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
					await i.respond({
						embeds: [
							new Embed({
								author: {
									name: "Bidome bot",
									icon_url: i.client.user!.avatarURL(),
								},
								title: "Voted to skip",
								description:
									`You have voted to skip the song! ${skippingUsers.length}/${
										Math.floor(voiceMembers.length / 2) + 1
									}`,
								footer: {
									icon_url: i.user.avatarURL(),
									text: `Vote by ${i.user.tag}${
										(await doPermCheck(
												i.member!,
												botState.channel,
											)) ||
											queue.player.current.requestedBy ==
												i.member!.id
											? " | Use forceskip to skip without a vote"
											: ""
									}`,
								},
							}).setColor("green"),
						],
					});
				} else {
					await i.respond({
						ephemeral: true,
						embeds: [
							new Embed({
								author: {
									name: "Bidome bot",
									icon_url: i.client.user!.avatarURL(),
								},
								title: "Already voted to skip",
								description:
									`You have already voted to skip the song! ${skippingUsers.length}/${
										Math.floor(voiceMembers.length / 2) + 1
									}`,
								footer: {
									text: (await doPermCheck(
											i.member!,
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

		return false;
	}
}
