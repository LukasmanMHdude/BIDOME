import { Command, CommandContext, Embed } from "harmony";

const responses = [
	"It is Certain.",
	"It is decidedly so.",
	"Without a doubt.",
	"Yes definitely.",
	"You may rely on it.",
	"As I see it, yes.",
	"Most likely.",
	"Outlook good.",
	"Yes.",
	"Signs point to yes.",
	"Reply hazy, try again.",
	"Ask again later.",
	"Better not tell you now.",
	"Cannot predict now.",
	"Concentrate and ask again.",
	"Don't count on it.",
	"My reply is no.",
	"My sources say no.",
	"Outlook not so good.",
	"Very doubtful.",
];

export default class Eightball extends Command {
	override name = "8ball";
	override description = "Just a regular 8ball";
	override aliases = ["magic8ball", "eightball", "magiceightball"];
	override usage = "8ball <question>";
	override category = "fun";
	override async execute(ctx: CommandContext) {
		if (ctx.argString === "") {
			await ctx.message.reply(undefined, {
				embeds: [
					new Embed({
						author: {
							name: "Bidome bot",
							icon_url: ctx.message.client.user!.avatarURL(),
						},
						title: "Magic 8Ball",
						description:
							`You need to provide a question to ask the Magic 8Ball!`,
					}).setColor("random"),
				],
			});
		} else {
			const message = await ctx.message.reply(undefined, {
				embeds: [
					new Embed({
						author: {
							name: "Bidome bot",
							icon_url: ctx.message.client.user!.avatarURL(),
						},
						title: "Magic 8Ball",
						description: `Contacting the oracle`,
					}).setColor("random"),
				],
			});
			await setTimeout(async () => {
				await message.edit({
					embeds: [
						new Embed({
							author: {
								name: "Bidome bot",
								icon_url: ctx.message.client.user!.avatarURL(),
							},
							title: "Magic 8Ball",
							fields: [
								{
									name: "Asked by",
									value: `${ctx.author.tag}`,
								},
								{
									name: "Asked",
									value: `${ctx.argString}`,
								},
								{
									name: "Response from the Magic 8Ball",
									value: responses[
										Math.floor(
											Math.random() *
												responses.length,
										)
									],
								},
							],
						}).setColor("random"),
					],
				});
			}, 2000);
		}
	}
}
