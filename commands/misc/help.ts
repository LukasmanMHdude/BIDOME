import {
	Command,
	CommandContext,
	Embed,
	isMessageComponentInteraction,
	MessageComponentData,
} from 'harmony';

import { format } from 'tools';

export class command extends Command {
	name = 'help';
	category = 'misc';
	aliases = ['cmds', 'commands'];
	usage = 'Help [command]';
	description = 'Get a list of commands or information regarding a command';
	async execute(ctx: CommandContext) {
		if (ctx.argString != '') {
			if (!ctx.client.commands.exists(ctx.argString)) {
				await ctx.message.reply(undefined, {
					embed: new Embed({
						author: {
							name: 'Bidome bot',
							icon_url: ctx.message.client.user?.avatarURL(),
						},
						title: 'Bidome help',
						description:
							"Unknown command! Please make sure it's a valid command!",
					}).setColor('random'),
				});
			} else {
				const description = [
					`Name: \`${format(
						ctx.client.commands.find(ctx.argString)?.name as string
					)}\``,
					`Description: \`${
						ctx.client.commands.find(ctx.argString)?.description ??
						'No description provided'
					}\``,
					`Usage: \`${
						ctx.client.commands.find(ctx.argString)?.usage ??
						'No usage provided'
					}\``,
					`Permission: \`${
						ctx.client.commands.find(ctx.argString)?.ownerOnly
							? 'Owner only'
							: ctx.client.commands.find(ctx.argString)
									?.userPermissions ??
							  'No permissions required'
					}\``,
					`Category: \`${format(
						ctx.client.commands.find(ctx.argString)?.category ??
							'Uncategorized'
					)}\``,
				];
				await ctx.message.reply(undefined, {
					embed: new Embed({
						author: {
							name: 'Bidome bot',
							icon_url: ctx.message.client.user?.avatarURL(),
						},
						title: 'Bidome help',
						fields: [
							{
								name: 'Command information',
								value: description.join('\n'),
							},
						],
						footer: {
							text: '[Arg] = Optional | <Arg> = Required',
						},
					}).setColor('random'),
				});
			}
		} else {
			const now = Date.now();

			const allcategories: string[] = [];
			const uncategorizedCmds: Command[] = [];

			for (const command of await ctx.client.commands.list.array()) {
				const category = (
					command.category ?? 'Uncategorized'
				).toLowerCase();
				if (!allcategories.includes(category)) {
					allcategories.push(category);
					if (category === 'uncategorized') {
						uncategorizedCmds.push(command);
					}
				}
			}

			const categories = allcategories.sort();

			const components: MessageComponentData[] = [];

			for (let i = 0; i < Math.ceil((categories.length + 1) / 5); i++) {
				const row: MessageComponentData[] = [];
				for (let b = 0; b < 5; b++) {
					const button = categories[b + i * 5];
					if (typeof button === 'undefined') continue;
					row.push({
						type: 2,
						label: format(button),
						style: 'BLURPLE',
						customID: `${button}-${now}`,
					});
				}
				components.push({
					type: 1,
					components: row,
				});
			}

			const message = await ctx.message.reply(undefined, {
				embed: new Embed({
					author: {
						name: 'Bidome bot',
						icon_url: ctx.message.client.user?.avatarURL(),
					},
					title: 'Bidome help',
					description:
						'Select a category from below to view the help menu!',
					footer: {
						text: 'This will expire in 30 seconds!',
					},
				}).setColor('random'),
				components: components,
			});
			const response = await ctx.message.client.waitFor(
				'interactionCreate',
				(i) =>
					isMessageComponentInteraction(i) &&
					i.customID.endsWith('-' + now) &&
					i.user.id === ctx.message.author.id,
				30 * 1000
			);

			if (!response[0]) {
				await message.edit({
					components: [],
					embed: new Embed({
						author: {
							name: 'Bidome bot',
							icon_url: ctx.message.client.user?.avatarURL(),
						},
						title: 'Bidome help',
						description: 'Help prompt timed out!',
					}).setColor('random'),
				});
				return;
			} else {
				if (!isMessageComponentInteraction(response[0])) return;
				const choice = response[0].customID.split('-')[0];
				const categorydata =
					choice.toLowerCase() === 'uncategorized'
						? uncategorizedCmds
						: ctx.client.commands.category(choice).array();
				const description = categorydata
					.map((cmd) => `${format(cmd.name)}`)
					.join('\n - ');

				await message.edit({
					components: [],
					embed: new Embed({
						author: {
							name: 'Bidome bot',
							icon_url: ctx.message.client.user?.avatarURL(),
						},
						title: `${format(choice)} Commands`,
						description:
							categorydata.length < 1
								? "I couldn't seem to find that category!"
								: '```\n - ' + description + '\n```',
						footer: {
							text: 'Need help with something? Check out our discord using the discord command!',
						},
					}).setColor('random'),
				});
			}
		}
	}
}
