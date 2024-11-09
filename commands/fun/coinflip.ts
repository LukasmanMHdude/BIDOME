import { Command, CommandContext, Embed } from "harmony";

export default class CoinFlip extends Command {
	override name = "coinflip";
	override aliases = ["cf", "coin"];
	override description = "Flip a coin";
	override usage = "Coinflip";
	override category = "fun";
	override async execute(ctx: CommandContext) {
		const sides = ["Heads", "Tails"];
		const message = await ctx.message.reply(undefined, {
			embeds: [
				new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.message.client.user!.avatarURL(),
					},
					title: "Coin flip",
					description: "Flipping the coin!",
				}).setColor("random"),
			],
		});
		await setTimeout(async () => {
			await message.edit(undefined, {
				embeds: [
					new Embed({
						author: {
							name: "Bidome bot",
							icon_url: ctx.message.client.user!.avatarURL(),
						},
						title: "Coin flip",
						description: `The coin landed on \`${
							sides[Math.floor(Math.random() * 2)]
						}\``,
					}).setColor("random"),
				],
			});
		}, 2000);
	}
}
