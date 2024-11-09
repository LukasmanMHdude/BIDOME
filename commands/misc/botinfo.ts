import { Command, CommandContext, Embed } from "harmony";
import { getEmote } from "i18n";

export default class Botinfo extends Command {
	override name = "botinfo";
	override category = "misc";
	override aliases = ["botstats", "info"];
	override description = "Get bot information";
	override usage = "Botinfo";
	override async execute(ctx: CommandContext) {
		const msg = await ctx.message.reply(undefined, {
			embeds: [
				new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.message.client.user!.avatarURL(),
					},
					title: "Bidome bot info",
					description: `${
						getEmote("typing")
					} Please wait, fetching data...`,
				}).setColor("random"),
			],
		});

		const data = {
			servers: 0,
			roles: 0,
			channels: 0,
			humans: 0,
			bots: 0,
			accounts: 0,
		};

		for await (const guild of ctx.client.guilds) {
			const members = await guild.members.array();
			data.accounts += guild.memberCount ?? 1;
			data.servers++;
			data.roles += await guild.roles.size();
			data.channels += await guild.channels.size();
			data.humans += members.filter((m) => !m.user.bot).length;
			data.bots += members.filter((m) => m.user.bot).length;
		}

		const isCachedUsers = data.accounts != data.humans + data.bots;

		await msg.edit({
			embeds: [
				new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.message.client.user!.avatarURL(),
					},
					fields: [
						{
							name: "Servers",
							value: `\`${data.servers}\``,
							inline: true,
						},
						{
							name: "Accounts",
							value: `\`${data.accounts}\``,
							inline: true,
						},
						{
							name: "Roles",
							value: `\`${data.roles}\``,
							inline: true,
						},
						{
							name: "Channels",
							value: `\`${data.channels}\``,
							inline: true,
						},
						{
							name: `Humans${isCachedUsers ? "*" : ""}`,
							value: `\`${data.humans}\``,
							inline: true,
						},
						{
							name: `Bots${isCachedUsers ? "*" : ""}`,
							value: `\`${data.bots}\``,
							inline: true,
						},
						{
							name: "Developers",
							value: "```yml\n- Bloxs\n- Lukas```",
							inline: true,
						},
						{
							name: "Library",
							value:
								"[Harmony](https://github.com/harmonyland/harmony)",
							inline: true,
						},
						{
							name: "Source code",
							value:
								"[Github](https://github.com/Wave-Studio/BIDOME)",
							inline: true,
						},
					],
					footer: {
						text: `${isCachedUsers ? `* Cached users` : ""}`,
					},
				}).setColor("random"),
			],
		});
	}
}
