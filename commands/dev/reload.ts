import { Command, CommandContext, Embed } from "harmony";
import { loopFilesAndReturn } from "tools";
import { clearInteractions, loadInteractions } from "shared";

export default class Reload extends Command {
	override name = "reload";
	override aliases = [
		"rl",
		"reloadcommand",
		"rlcmd",
		"reloadcmd",
		"rlcommand",
	];
	override description = "Reload a specific command";
	override category = "dev";
	override usage = "reload <command>";
	override ownerOnly = true;
	override async execute(ctx: CommandContext) {
		if (ctx.argString === "") {
			await ctx.message.reply(undefined, {
				embeds: [
					new Embed({
						author: {
							name: "Bidome bot",
							icon_url: ctx.message.client.user!.avatarURL(),
						},
						title: "Bidome Reload",
						description: "You need to provide a command!",
					}).setColor("red"),
				],
			});
		} else {
			const command = ctx.client.commands.find(ctx.argString);
			if (command == undefined) {
				await ctx.message.reply(undefined, {
					embeds: [
						new Embed({
							author: {
								name: "Bidome bot",
								icon_url: ctx.message.client.user!.avatarURL(),
							},
							title: "Bidome Reload",
							description: "Unknown command!",
						}).setColor("red"),
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
							title: "Bidome Reload",
							description: "Reloading...",
						}).setColor("random"),
					],
				});

				ctx.client.commands.list.delete(`${command.name}-0`);

				let didFindCommand = false;

				const commandFiles = await loopFilesAndReturn("./commands/");
				for (const file of commandFiles) {
					const cmdName = file
						.toLowerCase()
						.substring(
							file.lastIndexOf("/") + 1,
							file.lastIndexOf("."),
						);
					const importFilePath = `../.${file}#${Date.now()}`;
					if (cmdName == command.name.toLowerCase()) {
						didFindCommand = true;
						const imported = (await import(importFilePath)).default;
						ctx.client.commands.add(imported);
						break;
					}
				}

				clearInteractions();
				await loadInteractions();

				await message.edit(undefined, {
					embeds: [
						new Embed({
							author: {
								name: "Bidome bot",
								icon_url: ctx.message.client.user!.avatarURL(),
							},
							title: "Bidome Reloaded",
							description:
								`All interactions have been reloaded and command has ${
									didFindCommand ? "also " : ""
								}been ${
									didFindCommand
										? "reloaded!"
										: "unloaded as it could not be found locally!"
								}`,
						}).setColor("random"),
					],
				});

				console.log(
					`Command ${command.name} has been ${
						didFindCommand ? "reloaded" : "unloaded"
					} by ${ctx.author.username}`,
				);
			}
		}
	}
}
