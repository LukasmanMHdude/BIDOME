import { Command, CommandContext, Embed } from "harmony";
import { toMs } from "tools";

export default class ConvertTime extends Command {
	override name = "converttime";
	override aliases = ["converttimestamp"];
	override category = "utils";
	override description = "Convert a timestamp to a singular unit value";
	override async execute(ctx: CommandContext) {
		if (ctx.argString == "") {
			await ctx.message.reply(undefined, {
				embeds: [
					new Embed({
						author: {
							name: "Bidome bot",
							icon_url: ctx.client.user!.avatarURL(),
						},
						title: "Invalid command use!",
						description:
							"Please provide a timestamp such as `4h`, `1d`, or `1y1d`",
					}).setColor("random"),
				],
			});
		} else {
			const timestamp = toMs(ctx.argString);
			if (isNaN(timestamp)) {
				await ctx.message.reply(undefined, {
					embeds: [
						new Embed({
							author: {
								name: "Bidome bot",
								icon_url: ctx.client.user!.avatarURL(),
							},
							title: "Invalid timestamp!",
							description:
								"Please provide a valid timestamp such as `4h` or `1d`",
						}).setColor("random"),
					],
				});
			} else {
				const seconds = timestamp / 1000;
				const minutes = seconds / 60;
				const hours = minutes / 60;
				const days = hours / 24;
				const weeks = days / 7;

				await ctx.message.reply(undefined, {
					embeds: [
						new Embed({
							author: {
								name: "Bidome bot",
								icon_url: ctx.client.user!.avatarURL(),
							},
							title: "Here is your timestamp:",
							description: [
								`Miliseconds: \`${timestamp}\``,
								`Seconds: \`${seconds}\``,
								`Minutes: \`${minutes}\``,
								`Hours: \`${hours}\``,
								`Days: \`${days}\``,
								`Weeks: \`${weeks}\``,
							].join("\n"),
						}).setColor("random"),
					],
				});
			}
		}
	}
}
