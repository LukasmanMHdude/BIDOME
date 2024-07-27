import {
	ApplicationCommandPartial,
	ApplicationCommandType,
	Client,
	type ClientOptions,
	event,
	type Message,
} from "@harmony/harmony";
import {
	ApplicationInstallType,
	ApplicationUseContextType,
	type Command,
} from "./command.ts";

export interface CommanderOptions extends ClientOptions {
	/** List of valid prefixes */
	prefix?: string[];
	/** If a mention is allowed as a prefix */
	allowMentionPrefix?: boolean;
	/** If a space is allowed between mention prefixes */
	allowSpaceAfterMentionPrefix?: boolean;
	/** If Slash command support is enabled */
	enableSlashCommands?: boolean;
	/** If Text command support is enabled */
	enableTextCommands?: boolean;
	/** Array of owner user ids */
	owners?: string[];
	/** Global bot cooldown in MS */
	globalCooldown?: number;
	/** Global command cooldown in MS */
	globalCommandCooldown?: number;
	/** Global server command cooldown in MS */
	globalServerCooldown?: number;
	/** Global channel command cooldown in MS */
	globalChannelCooldown?: number;
	/** Global user command cooldown in MS */
	globalUserCooldown?: number;

	getGuildPrefix?: (
		guildId: string,
	) => Promise<string> | Promise<string[]> | string | string[];
	getUserPrefix?: (
		userId: string,
	) => Promise<string> | Promise<string[]> | string | string[];
	getChannelPrefix?: (
		channelId: string,
	) => Promise<string> | Promise<string[]> | string | string[];

	isGuildBlacklisted?: (guildId: string) => Promise<boolean> | boolean;
	isChannelBlacklisted?: (
		channelId: string,
		guildId: string,
	) => Promise<boolean> | boolean;
	isUserBlacklisted?: (
		userId: string,
		channelId: string,
		guildId: string,
	) => Promise<boolean> | boolean;
}

export interface ExtendedApplicationCommandPartial
	extends ApplicationCommandPartial {
	/** Where the command can be installed */
	integration_types?: (0 | 1)[];
	contexts?: (0 | 1 | 2)[];
}

export class Commander extends Client {
	private commands: Command[] = [];

	constructor(private options: CommanderOptions) {
		super(options);
	}

	/** Add a command to the bot */
	public addCommand(command: Command) {
		// Currently this will only allow one command class for the top level cmd, maybe in the future
		// allowing subcommands to be added from the top level command class would be supported - Bloxs
		const existingCommand = this.commands.find((c) =>
			c.name.split(" ")[0].toLowerCase() ===
				command.name.split(" ")[0].toLowerCase()
		);

		if (existingCommand) {
			throw new Error(`Command with name ${command.name} already exists`);
		}

		this.commands.push(command);
	}

	/** Remove a command from the bot */
	public removeCommand(command: Command | string): void | false {
		if (typeof command === "string") {
			if (command.includes(" ")) {
				// TODO: This - Bloxs
			} else {
				const index = this.commands.findIndex(
					(c) => c.name === command,
				);

				if (index === -1) {
					return false;
				}

				this.commands.splice(index, 1);
			}
		} else {
			const index = this.commands.indexOf(command);

			if (index === -1) {
				return false;
			}

			this.commands.splice(index, 1);
		}
	}

	/** Get a command by name */
	public getCommand(name: string): Command | undefined {
		// TODO: Implement subcommand support - Bloxs
		return this.commands.find((c) => c.name === name);
	}

	/** Get all commands */
	public getCommands(): Command[] {
		return this.commands;
	}

	/** Get all commands in a category */
	public getCommandsInCategory(category: string | undefined): Command[] {
		return this.commands.filter((c) => c.category === category);
	}

	/** Get all command categories */
	public getCommandCategories(): (string | undefined)[] {
		const mapSubCommands = (command: Command): (string | undefined)[] => {
			if (command.subCommands) {
				return command.subCommands.map((
					c,
				) => [c.category, ...mapSubCommands(c)]).flat();
			}

			return [];
		};

		return [
			...new Set(
				this.commands.map((c) => [c.category, ...mapSubCommands(c)])
					.flat(),
			),
		];
	}

	/** 
	 * Generate JSON for all slash commands
	 * 
	 * This uses ExtendedApplicationCommandPartial due to harmony
	 * not supporting user commands yet
	*/
	public generateSlashCommandJSON(): ExtendedApplicationCommandPartial[] {
		const slashCommandJSON: ExtendedApplicationCommandPartial[] = [];

		for (
			const command of this.commands.sort((a, b) =>
				a.name.localeCompare(b.name)
			)
		) {
			if (command.textOnly) continue;
			if (command.disabled) continue;
			if ((command.subCommands?.length ?? 0) > 0) {
				// TODO: Implement subcommand support - Bloxs
			} else {
				slashCommandJSON.push({
					name: command.name,
					description: command.description,
					type: command.commandType ??
						ApplicationCommandType.CHAT_INPUT,
					integration_types: command.commandInstallType?.map((t) => {
						if (!isNaN(t)) {
							return t;
						}
						if (t === ApplicationInstallType.USER_INSTALL) return 1;
						if (t === ApplicationInstallType.GUILD_INSTALL) {
							return 0;
						}
						return 0;
					}),
					contexts: command.commandUseContext?.map((t) => {
						if (!isNaN(t)) {
							return t;
						}

						if (t === ApplicationUseContextType.GUILD) return 0;
						if (t === ApplicationUseContextType.BOT_DM) return 1;
						if (t === ApplicationUseContextType.PRIVATE_CHANNEL) {
							return 2;
						}
						return 0;
					}),
					// TODO: Implement argument support
				});
			}
		}

		return slashCommandJSON.sort((a, b) => a.name.localeCompare(b.name));
	}

	/** Check if the commands published to discord differ from what's locally present */
	public async compareSlashToPublishedCommands(): Promise<boolean> {
		const slashCommandJSON = this.generateSlashCommandJSON();
		const publishedCommands = (await this.interactions.commands.all())
			.array().sort((a, b) => a.name.localeCompare(b.name));

		if (slashCommandJSON.length !== publishedCommands.length) {
			return true;
		}

		for (let i = 0; i < slashCommandJSON.length; i++) {
			if (
				slashCommandJSON[i].name !== publishedCommands[i].name ||
				slashCommandJSON[i].description !==
					publishedCommands[i].description ||
				slashCommandJSON[i].type !== publishedCommands[i].type
			) {
				return true;
			}
		}

		return false;
	}

	@event("messageCreate")
	async onMessageCreate(message: Message) {
		console.log(message);
	}
}
