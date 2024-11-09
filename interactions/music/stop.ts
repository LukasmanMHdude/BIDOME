import {
	Embed,
	InteractionResponseType,
	MessageComponentInteraction,
} from "harmony";
import { doPermCheck, queues } from "queue";

export async function button(i: MessageComponentInteraction) {
	if (i.customID == "stop-song") {
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
			if (await doPermCheck(i.member!, botState.channel)) {
				queue.deleteQueue(true);
				await i.respond({
					type: InteractionResponseType.DEFERRED_MESSAGE_UPDATE,
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
							title: "Unable to disconnect",
							description:
								"You are missing the `ADMINISTRATOR` permission and you are not alone in the channel!",
						}).setColor("red"),
					],
				});
			}
		}

		return false;
	}
}
