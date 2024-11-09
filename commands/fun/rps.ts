import {
	Command,
	CommandContext,
	Embed,
	isMessageComponentInteraction,
} from "harmony";
import { format } from "tools";
import { emoji } from "emoji";

export default class RPS extends Command {
	override name = "rps";
	override aliases = ["rockpaperscissors"];
	override description = "Play RPS against the bot";
	override usage = "Rps";
	override category = "fun";

	override async execute(ctx: CommandContext) {
		const options = ["scissors", "rock", "paper"];
		const emojis = [
			emoji("scissors"),
			emoji("rock"),
			emoji("page_facing_up"),
		];
		const botChoice = options[Math.floor(Math.random() * options.length)];

		if (ctx.argString.trim() != "") {
			if (!options.includes(ctx.argString.trim().toLowerCase())) {
				await ctx.message.reply({
					embeds: [
						new Embed({
							author: {
								name: "Bidome bot",
								icon_url: ctx.client.user!.avatarURL(),
							},
							title: "Invalid option!",
							description:
								`Please select one of the following options: \`${
									options
										.map((m) => format(m))
										.join("`, `")
								}\``,
						}).setColor("red"),
					],
				});
			} else {
				const userChoice = ctx.argString.trim().toLowerCase();

				await ctx.message.reply({
					embeds: [
						new Embed({
							author: {
								name: "Bidome bot",
								icon_url: ctx.client.user!.avatarURL(),
							},
							title: "RPS",
							fields: [
								{
									name: userChoice == botChoice
										? "It's a tie!"
										: (userChoice == "scissors" &&
												botChoice == "paper") ||
												(userChoice == "paper" &&
													botChoice == "rock") ||
												(userChoice == "rock" &&
													botChoice == "scissors")
										? "You win!"
										: "I win!",
									value: [
										`${
											emojis[options.indexOf(botChoice)]
										} <@!${ctx.client.user!.id}>`,
										`${
											emojis[options.indexOf(userChoice)]
										} <@!${ctx.author.id}>`,
									].join("\n"),
								},
							],
						}).setColor("random"),
					],
					components: [],
				});
			}
		} else {
			await ctx.message.reply(undefined, {
				embeds: [
					new Embed({
						author: {
							name: "Bidome bot",
							icon_url: ctx.client.user!.avatarURL(),
						},
						title: "RPS",
						description: "Select your move!",
						footer: {
							icon_url: ctx.author.avatarURL(),
							text: "Requested by " + ctx.author.tag,
						},
					}).setColor("random"),
				],
				components: [
					{
						type: 1,
						components: options.map((opt) => ({
							type: 2,
							label: format(opt),
							style: "BLURPLE",
							customID: `rps-${opt}`,
						})),
					},
				],
			});
		}
	}

	async oldexecute(ctx: CommandContext) {
		const options = ["Scissors", "Rock", "Paper"];
		const now = Date.now();
		const message = await ctx.message.reply(undefined, {
			embeds: [
				new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.message.client.user!.avatarURL(),
					},
					title: "RPS",
					description: "Select your move!",
					footer: {
						text: "This will time out in 30 seconds!",
					},
				}).setColor("random"),
			],
			components: [
				{
					type: 1,
					components: options.map((opt) => ({
						type: 2,
						label: format(opt),
						style: "BLURPLE",
						customID: `${opt.toLowerCase()}-${now}`,
					})),
				},
			],
		});
		const choice = await ctx.client.waitFor(
			"interactionCreate",
			(i) =>
				isMessageComponentInteraction(i) &&
				i.customID.endsWith(`-${now}`),
			30 * 1000,
		);
		if (!choice[0]) {
			await message.edit({
				embeds: [
					new Embed({
						author: {
							name: "Bidome bot",
							icon_url: ctx.message.client.user!.avatarURL(),
						},
						title: "RPS",
						description: "Selection timed out!",
					}).setColor("random"),
				],
			});
		} else {
			if (!isMessageComponentInteraction(choice[0])) return;
			const botchoice =
				options[Math.floor(Math.random() * options.length)];
			const playerchoice = format(choice[0].customID.split("-")[0]);
			if (botchoice === playerchoice) {
				await message.edit({
					embeds: [
						new Embed({
							author: {
								name: "Bidome bot",
								icon_url: ctx.message.client.user!.avatarURL(),
							},
							title: "RPS",
							fields: [
								{
									name: "It's a tie!",
									value:
										`Bot: \`${botchoice}\`\n You: \`${playerchoice}\``,
								},
							],
						}).setColor("random"),
					],
					components: [],
				});
			} else {
				await message.edit({
					embeds: [
						new Embed({
							author: {
								name: "Bidome bot",
								icon_url: ctx.message.client.user!.avatarURL(),
							},
							title: "RPS",
							fields: [
								{
									name: (botchoice === "Scissors" &&
											playerchoice === "Paper") ||
											(botchoice === "Paper" &&
												playerchoice === "Rock") ||
											(botchoice === "Rock" &&
												playerchoice === "Scissors")
										? `Bot Wins`
										: `${ctx.author.username} Wins`,
									value:
										`Bot: \`${botchoice}\`\n You: \`${playerchoice}\``,
								},
							],
						}).setColor("random"),
					],
					components: [],
				});
			}
			return;
		}
	}
}
