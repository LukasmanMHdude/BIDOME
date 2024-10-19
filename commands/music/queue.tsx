import {
	ActionRow,
	BotUI,
	Button,
	Command,
	CommandContext,
	Embed,
	fragment,
} from "harmony";
import { queues } from "queue";
import { getEmojiByName } from "emoji";
import { formatMs } from "tools";

export default class Queue extends Command {
	name = "queue";
	aliases = ["q"];
	category = "music";
	description = "View the current queue";

	async execute(ctx: CommandContext) {
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
			const emojiMap = [
				getEmojiByName("arrow_forward"),
				getEmojiByName("one"),
				getEmojiByName("two"),
				getEmojiByName("three"),
				getEmojiByName("four"),
				getEmojiByName("five"),
				getEmojiByName("six"),
				getEmojiByName("seven"),
				getEmojiByName("eight"),
				getEmojiByName("nine"),
			];
			const queueEntries = [...queue.queue, ...queue.playedSongQueue];

			await ctx.message.reply(undefined, {
				embeds: [
					new Embed({
						author: {
							name: "Bidome bot",
							icon_url: ctx.client.user!.avatarURL(),
						},
						title: "Server queue",
						description: queueEntries
							.slice(0, 10)
							.map(
								({ title, url }, index) =>
									`${emojiMap[index]} [${title}](${url})`,
							)
							.join("\n"),
						footer: {
							icon_url: ctx.author.avatarURL(),
							text:
								`Songs in queue: ${queueEntries.length} | Length: ${
									formatMs(queue.queueLength)
								}`,
						},
					}).setColor("random"),
				],
				components: (
					<>
						<ActionRow>
							<Button
								style={"blurple"}
								disabled={true}
								id={"queuepg-0"}
								emoji={{
									name: getEmojiByName("arrow_left"),
								}}
							/>
							<Button
								style={"blurple"}
								id={"queuepg-1"}
								disabled={queueEntries.length <= 10}
								emoji={{
									name: getEmojiByName("arrow_right"),
								}}
							/>
						</ActionRow>
					</>
				),
			});
		}
	}
}
