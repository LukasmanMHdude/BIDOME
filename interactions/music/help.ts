import { Embed, MessageComponentInteraction } from "harmony";
import { emoji } from "emoji";

export async function button(i: MessageComponentInteraction) {
	if (i.customID == "help-song") {
		await i.respond({
			ephemeral: true,
			embeds: [
				new Embed({
					author: {
						name: "Bidome bot",
						icon_url: i.client.user!.avatarURL(),
					},
					title: "Now Playing - Help",
					description: [
						`${emoji("question")} - Show this menu`,
						`${emoji("stop_button")} - Disconnect the player`,
						`${
							emoji("fast_forward")
						} - Vote to skip the current song`,
						`${
							emoji("twisted_rightwards_arrows")
						} - Shuffle the queue`,
						`${
							emoji(
								"arrows_counterclockwise",
							)
						} - Refresh the nowplaying embed`,
					].join("\n"),
				}).setColor("random"),
			],
		});
		return false;
	}
}
