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
import { emoji } from "emoji";
import { formatMs } from "tools";

export default class Queue extends Command {
	override name = "queue";
	override aliases = ["q"];
	override category = "music";
	override description = "View the current queue";

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
				emoji("arrow_forward"),
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
			const queueEntries = [
				queue.player.current!,
				...queue.player.queue.values(),
			];

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
								disabled={true}
								id={"queuepg-0"}
								emoji={{
									name: emoji("arrow_left"),
								}}
							/>
							<Button
								style={"blurple"}
								id={"queuepg-1"}
								disabled={queueEntries.length <= 10}
								emoji={{
									name: emoji("arrow_right"),
								}}
							/>
						</ActionRow>
					</>
				),
			});
		}
	}
}
