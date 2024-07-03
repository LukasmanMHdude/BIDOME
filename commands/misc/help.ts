import {
	Command,
	CommandContext,
	Embed,
	isMessageComponentInteraction,
	MessageComponentData,
} from "harmony";
import { getString } from "i18n";
import { format } from "tools";

export default class Help extends Command {
	name = "help";
	category = "misc";
	aliases = ["cmds", "commands"];
	usage = "Help [command]";
	description = "Get a list of commands or information regarding a command";
	async execute(ctx: CommandContext) {
		const userLanguage = "en";
		if (ctx.argString != "") {
			if (!ctx.client.commands.exists(ctx.argString)) {
				await ctx.message.reply(undefined, {
					embeds: [
						new Embed({
							author: {
								name: "Bidome bot",
								icon_url: ctx.message.client.user!.avatarURL(),
							},
							title: getString(
								userLanguage,
								"commands.help.unknownCommand.title",
							),
							description: getString(
								userLanguage,
								"commands.help.unknownCommand.description",
							),
						}).setColor("red"),
					],
				});
			} else {
				await ctx.message.reply(undefined, {
					embeds: [
						new Embed({
							author: {
								name: "Bidome bot",
								icon_url: ctx.message.client.user!.avatarURL(),
							},
							title: getString(
								userLanguage,
								"commands.help.commandInfo.title",
							),
							fields: [
								{
									name: getString(
										userLanguage,
										"commands.help.commandInfo.field.name",
									),
									value: getString(
										userLanguage,
										"commands.help.commandInfo.field.value",
										format(
											ctx.client.commands.find(
												ctx.argString,
											)!.name,
										),
										ctx.client.commands.find(ctx.argString)!
											.description ??
											"No description provided",
										ctx.client.commands.find(ctx.argString)!
											.usage ??
											"No usage provided",
										ctx.client.commands.find(ctx.argString)!
												.ownerOnly
											? "Owner only"
											: ctx.client.commands.find(
												ctx.argString,
											)!
												.userPermissions ??
												"No permissions required",
										ctx.client.commands.find(ctx.argString)!
											.category ??
											"Uncategorized",
									),
								},
							],
							footer: {
								text: getString(
									userLanguage,
									"commands.help.commandInfo.footer",
								),
							},
						}).setColor("random"),
					],
				});
			}
		} else {
			const now = Date.now();

			const allcategories: string[] = [];
			const uncategorizedCmds: Command[] = [];

			for (const command of await ctx.client.commands.list.array()) {
				const category = (command.category ?? "Uncategorized")
					.toLowerCase();

				if (
					command.userPermissions != undefined && !command.ownerOnly
				) {
					const perms = typeof command.userPermissions == "string"
						? [command.userPermissions]
						: command.userPermissions;
					let hasPerms = true;
					for (const perm of perms) {
						if (
							!ctx.message.member!.permissions.has(perm) &&
							!ctx.client.owners.includes(ctx.author!.id)
						) {
							hasPerms = false;
						}
					}

					if (!hasPerms) {
						continue;
					}
				}

				if (command.ownerOnly) {
					if (!ctx.client.owners.includes(ctx.author.id)) continue;
				}

				if (!allcategories.includes(category)) {
					allcategories.push(category);
					if (category === "uncategorized") {
						uncategorizedCmds.push(command);
					}
				}
			}

			const categories = allcategories.sort();

			const components: MessageComponentData[] = [];

			for (let i = 0; i < Math.ceil(categories.length / 5); i++) {
				const row: MessageComponentData[] = [];
				for (let b = 0; b < 5; b++) {
					const button = categories[b + i * 5];
					if (typeof button === "undefined" || button === "") {
						continue;
					}
					row.push({
						type: 2,
						label: format(button),
						style: "BLURPLE",
						customID: `${button}-${now}`,
					});
				}
				components.push({
					type: 1,
					components: row,
				});
			}

			const message = await ctx.message.reply(undefined, {
				embeds: [
					new Embed({
						author: {
							name: "Bidome bot",
							icon_url: ctx.message.client.user!.avatarURL(),
						},
						title: "Bidome help",
						description:
							"Select a category from below to view the help menu!",
						footer: {
							text: "This will expire in 30 seconds!",
						},
					}).setColor("random"),
				],
				components: components,
			});
			const response = await ctx.message.client.waitFor(
				"interactionCreate",
				(i) =>
					isMessageComponentInteraction(i) &&
					i.customID.endsWith("-" + now) &&
					i.user.id === ctx.message.author.id,
				30 * 1000,
			);

			if (!response[0]) {
				await message.edit({
					components: [],
					embeds: [
						new Embed({
							author: {
								name: "Bidome bot",
								icon_url: ctx.message.client.user!.avatarURL(),
							},
							title: "Bidome help",
							description: "Help prompt timed out!",
						}).setColor("random"),
					],
				});
				return;
			} else {
				if (!isMessageComponentInteraction(response[0])) return;
				const choice = response[0].customID.split("-")[0];
				const categorydata = choice.toLowerCase() === "uncategorized"
					? uncategorizedCmds
					: ctx.client.commands.category(choice).array();
				let description = categorydata
					.sort()
					.map((cmd) => `${format(cmd.name)}`)
					.join("\n - ");
				
				if (choice.toLowerCase() == "music") {
					description += `\n - Shuffleplay`
				}

				description = description.split("\n").sort().join("\n");

				await message.edit({
					components: [],
					embeds: [
						new Embed({
							author: {
								name: "Bidome bot",
								icon_url: ctx.message.client.user!.avatarURL(),
							},
							title: `${format(choice)} Commands`,
							description: categorydata.length < 1
								? "I couldn't seem to find that category!"
								: "```\n - " + description + "\n```",
							footer: {
								text:
									`Need help with something? Check out our discord using ${ctx.prefix}discord`,
							},
						}).setColor("random"),
					],
				});
			}
		}
	}
}
