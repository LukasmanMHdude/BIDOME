import { Command, CommandContext, Embed } from "harmony";

export default class ServerInfo extends Command {
	override name = "serverinfo";
	override aliases = ["si", "server-info", "guildinfo", "gi"];
	override category = "utils";
	override description = "Get information regarding this server";
	override usage = "Serverinfo";
	override async execute(ctx: CommandContext) {
		const membersArray = (await ctx.message.guild?.members.array()) ?? [];
		const owner = (await ctx.message.guild!.members.resolve(
			ctx.message.guild!.ownerID as string,
		)) ??
			(await ctx.guild?.members.fetch(
				ctx.message.guild!.ownerID as string,
			));

		await ctx.message.reply(undefined, {
			embeds: [
				new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.message.client.user!.avatarURL(),
					},
					fields: [
						{
							name: `Accounts`,
							value: `${ctx.message.guild?.memberCount ?? 0}`,
							inline: true,
						},
						{
							name: `Humans`,
							value: `${
								membersArray.filter((m) => !m.user.bot)
									.length ?? 0
							}`,
							inline: true,
						},
						{
							name: `Bots`,
							value: `${
								membersArray.filter((m) => m.user.bot).length ??
									0
							}`,
							inline: true,
						},
						{
							name: "Channels",
							value: `${
								(await ctx.message.guild?.channels.size()) ?? 0
							}`,
							inline: true,
						},
						{
							name: "Roles",
							value: `${
								(await ctx.message.guild?.roles.size()) ?? 0
							}`,
							inline: true,
						},
						{
							name: "Owner",
							value: `${
								owner!.user.mention ?? "`Unable to fetch`"
							}`,
							inline: true,
						},
						{
							name: "Creation Date",
							// Hacky workaround
							value: `<t:${
								(new Date(owner!.joinedAt).getTime() / 1000)
									.toFixed(
										0,
									)
							}:F>`,
							inline: true,
						},
					],
					footer: {
						text: `*Results may be inaccurate due to caching`,
					},
				}).setColor("random"),
			],
		});
	}
}
