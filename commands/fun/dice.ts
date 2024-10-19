import {
	Command,
	CommandContext,
	Embed,
	isMessageComponentInteraction,
} from "harmony";

export default class Dice extends Command {
	name = "dice";
	aliases = ["diceroll", "rolladice", "roll"];
	category = "fun";
	usage = "Dice [size]";
	description = "Roll a Dice";
	async execute(ctx: CommandContext) {
		if (ctx.argString != "") {
			const size = parseInt(ctx.argString);
			if (!isNaN(size)) {
				await ctx.message.reply(undefined, {
					embeds: [
						new Embed({
							author: {
								name: "Bidome bot",
								icon_url: ctx.message.client.user!.avatarURL(),
							},
							title: "Dice roll",
							description: `The dice rolled a \`${
								Math.floor(Math.random() * (size - 1 + 1)) + 1
							}\``,
						}).setColor("random"),
					],
					components: [],
				});

				return;
			}
		}

		const now = Date.now();
		const message = await ctx.message.reply(undefined, {
			embeds: [
				new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.message.client.user!.avatarURL(),
					},
					title: "Dice size",
					description: "Please select a size for the dice!",
					footer: {
						text: "This will time out in 30 seconds!",
					},
				}).setColor("random"),
			],
			components: [
				{
					type: 1,
					components: [4, 6, 8, 10, 12].map((size) => ({
						type: 2,
						label: `${size}`,
						style: "BLURPLE",
						customID: `${size}-${now}`,
					})),
				},
				{
					type: 1,
					components: [20, 24, 32, 48, 60].map((size) => ({
						type: 2,
						label: `${size}`,
						style: "BLURPLE",
						customID: `${size}-${now}`,
					})),
				},
			],
		});
		const selected = await ctx.client.waitFor(
			"interactionCreate",
			(i) =>
				isMessageComponentInteraction(i) &&
				i.customID.endsWith(`-${now}`) &&
				i.user.id === ctx.author.id,
			30 * 1000,
		);
		if (!selected[0]) {
			await message.edit(undefined, {
				embeds: [
					new Embed({
						author: {
							name: "Bidome bot",
							icon_url: ctx.message.client.user!.avatarURL(),
						},
						title: "Dice size",
						description: "Selection timed out!",
					}).setColor("random"),
				],
				components: [],
			});
			return;
		} else {
			if (!isMessageComponentInteraction(selected[0])) return;
			const size = parseInt(selected[0].customID.split("-")[0]);
			await message.edit(undefined, {
				embeds: [
					new Embed({
						author: {
							name: "Bidome bot",
							icon_url: ctx.message.client.user!.avatarURL(),
						},
						title: "Dice roll",
						description: `The dice rolled a \`${
							Math.floor(Math.random() * (size - 1 + 1)) + 1
						}\``,
					}).setColor("random"),
				],
				components: [],
			});
			return;
		}
	}
}
