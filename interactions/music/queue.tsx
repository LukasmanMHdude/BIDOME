import {
	ActionRow,
	BotUI,
	Button,
	Embed,
	fragment,
	InteractionResponseType,
	MessageComponentInteraction,
} from "harmony";
import { emoji } from "emoji";
import { queues } from "queue";
import { formatMs } from "tools";

export async function button(i: MessageComponentInteraction) {
	if (i.customID.startsWith("queuepg-")) {
		const pageOffset = parseInt(i.customID.split("-")[1]);
		const startingValue = pageOffset * 10;
		if (!queues.has(i.guild!.id)) {
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
		} else {
			if (
				i.message.embeds[0]
					.footer!.icon_url!.split("/avatars/")[1]
					.split("/")[0] === i.user.id
			) {
				const queue = queues.get(i.guild!.id)!;

				const convertNumberToEmoji = (number: number) => {
					const emojiMap = [
						pageOffset < 1 ? emoji("arrow_forward") : emoji("zero"),
						emoji("one"),
						emoji("two"),
						emoji("three"),
						emoji("four"),
						emoji("five"),
						emoji("six"),
						emoji("seven"),
						emoji("eight"),
						emoji("nine"),
					];
					let str = "";

					for (const part of number.toString().split("")) {
						str += emojiMap[parseInt(part)];
					}
					return str;
				};

				await i.message.edit(undefined, {
					embeds: [
						new Embed({
							author: {
								name: "Bidome bot",
								icon_url: i.client.user!.avatarURL(),
							},
							title: "Server queue",
							description: [
								queue.player.current,
								...queue.player.queue.tracks,
							]
								.slice(startingValue, startingValue + 10)
								.map(
									({ title, url }, index) =>
										`${
											convertNumberToEmoji(
												parseInt(
													`${pageOffset}${index}`,
												),
											)
										} [${title}](${url})`,
								)
								.join("\n"),
							footer: {
								icon_url: i.user.avatarURL(),
								text:
									`Songs in queue: ${queue.player.queue.size} | Length: ${
										formatMs(
											queue.queueLength,
										)
									}`,
							},
						}).setColor("random"),
					],
					components: (
						<>
							<ActionRow>
								<Button
									style={"blurple"}
									disabled={pageOffset < 1}
									id={pageOffset < 1
										? "queuepg-0"
										: `queuepg-${pageOffset - 1}`}
									emoji={{
										name: emoji("arrow_left"),
									}}
								/>
								<Button
									style={"blurple"}
									id={`queuepg-${pageOffset + 1}`}
									disabled={queue.player.queue.size <=
										startingValue + 10}
									emoji={{
										name: emoji("arrow_right"),
									}}
								/>
							</ActionRow>
						</>
					),
				});
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
							title: "Unable to show page!",
							description: "This is not your queue message!",
						}).setColor("red"),
					],
				});
			}
		}

		return false;
	}
}
