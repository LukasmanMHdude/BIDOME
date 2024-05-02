import { Command, CommandContext, Embed, GuildTextChannel } from "harmony";

export default class SayChannel extends Command {
	name = "saychannel";
	aliases = ["echochannel"];
	description = "Make the bot say something";
	category = "dev";
	usage = "saychannel <channelid> <message>";
	ownerOnly = true;
	async execute(ctx: CommandContext) {
		const [channelId, ...message] = ctx.argString.split(" ");
		if (channelId == "" || message.length == 0) {
			await ctx.message.reply(undefined, {
				embeds: [new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.message.client.user!.avatarURL(),
					},
					title: "Bidome say",
					description: `You need to provide a message`,
				}).setColor("red")],
			});
		} else {
			const channel = await ctx.client.channels.resolve(channelId) as GuildTextChannel;

			if (channel === undefined) {
				await ctx.message.reply(undefined, {
					embeds: [new Embed({
						author: {
							name: "Bidome bot",
							icon_url: ctx.message.client.user!.avatarURL(),
						},
						title: "Bidome say",
						description: `Unable to find the channel you provided`,
					}).setColor("red")],
				});
			}

			await channel.send(ctx.argString);
		}
	}
}
