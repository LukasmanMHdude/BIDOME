import {
	Command,
	CommandContext,
	Embed,
	isMessageComponentInteraction,
} from 'harmony';
import { format } from 'tools';

export class command extends Command {
	name = 'setpresence';
	ownerOnly = true;
	category = 'dev';
	description = "Change the bot's presence";
	usage = 'Setpresence';
	async execute(ctx: CommandContext) {
		const now = Date.now();
		const message = await ctx.message.reply(undefined, {
			embed: new Embed({
				author: {
					name: 'Bidome bot',
					icon_url: ctx.message.client.user?.avatarURL(),
				},
				title: 'Bot status',
				description: 'Please select the status type!',
				footer: {
					text: 'This will time out in 30 seconds!',
				},
			}).setColor('random'),
			components: [
				{
					type: 1,
					components: ['dnd', 'idle', 'online', 'invisible'].map(
						(status) => ({
							type: 2,
							label: format(status),
							style: 'BLURPLE',
							customID: `${status.toLowerCase()}-${now}`,
						})
					),
				},
			],
		});

		const choice = await ctx.client.waitFor(
			'interactionCreate',
			(i) =>
				isMessageComponentInteraction(i) &&
				i.customID.endsWith(`-${now}`) &&
				i.user.id === ctx.author.id,
			30 * 1000
		);
		if (!choice[0]) {
			await message.edit(undefined, {
				embed: new Embed({
					author: {
						name: 'Bidome bot',
						icon_url: ctx.message.client.user?.avatarURL(),
					},
					title: 'Bot status',
					description: 'Presence change timed out!',
				}).setColor('random'),
				components: [],
			});
			return;
		} else {
			if (!isMessageComponentInteraction(choice[0])) return;
			const type = choice[0].customID.split('-')[0].toUpperCase() as
				| 'dnd'
				| 'idle'
				| 'online'
				| 'invisible';
			ctx.client.setPresence({
				status: type,
			});
			await message.edit(undefined, {
				embed: new Embed({
					author: {
						name: 'Bidome bot',
						icon_url: ctx.message.client.user?.avatarURL(),
					},
					title: 'Bot status',
					description: 'Presence has been changed!',
				}).setColor('random'),
				components: [],
			});
		}
	}
}
