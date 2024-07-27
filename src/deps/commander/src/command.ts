import type { ApplicationCommandType } from "@harmony/harmony";
import type { CommandContext } from "./commandcontext.ts";

export enum ApplicationInstallType {
	/** App is installable to servers */
	GUILD_INSTALL = 0,
	/** App is installable to users */
	USER_INSTALL = 1,
}

export enum ApplicationUseContextType {
	/**	Interaction can be used within servers */
	GUILD = 0,
	/**	Interaction can be used within DMs with the app's bot user */
	BOT_DM = 1,
	/**	Interaction can be used within Group DMs and DMs other than the app's bot user */
	PRIVATE_CHANNEL = 2,
}

export interface CommandOptions {
	/** Name of the command */
	name: string;
	/** Category for the command */
	category?: string;
	/** Usage of the command */
	usage?: string[];
	/** Examples of the command */
	examples?: string[];
	/** Description of the command */
	description?: string;
	/** Other valid commands for this command (text commands only) */
	aliases?: string[];
	/** If only the owner(s) can run this command */
	ownerOnly?: boolean;
	/** Permissions the user requires to run the command */
	requiredPermissions?: string[];
	/** If the owner can bypass permission checks */
	ownerBypassesPermissions?: boolean;
	/** If the user can bypass command cooldowns */
	ownerBypassesCooldowns?: boolean;
	/** Cooldown in MS */
	userCooldown?: number;
	/** Cooldown in MS */
	channelCooldown?: number;
	/** Cooldown in MS */
	serverCooldown?: number;
	/** Cooldown in MS */
	globalCooldown?: number;
	/** If the command is only usable in slash form */
	slashOnly?: boolean;
	/** If the command is only usable in text form */
	textOnly?: boolean;
	/** If the command isn't listed in help commands (This does not apply to commander but rather for custom developed help menus) */
	hidden?: boolean;
	/** If the command is disabled */
	disabled?: boolean;
	/** [Slash Only] Command type */
	commandType?: ApplicationCommandType;
	/** [Slash Only] Where your command should be installable as (Defaults to guild) */
	commandInstallType?: ApplicationInstallType[];
	/** [Slash Only] Where the command can be used */
	commandUseContext?: ApplicationUseContextType[];
	/** Command executor */
	execute(ctx: CommandContext): Promise<void> | void;
}

export class Command implements CommandOptions {
	name: string = "";
	category?: string;
	usage?: string[];
	examples?: string[];
	description?: string;
	aliases?: string[];
	ownerOnly?: boolean;
	requiredPermissions?: string[];
	ownerBypassesPermissions?: boolean;
	ownerBypassesCooldowns?: boolean;
	userCooldown?: number;
	channelCooldown?: number;
	serverCooldown?: number;
	globalCooldown?: number;
	slashOnly?: boolean;
	textOnly?: boolean;
	hidden?: boolean;
	disabled?: boolean;
	commandType?: ApplicationCommandType;
	commandInstallType?: (ApplicationInstallType | 0 | 1)[];
	commandUseContext?: (ApplicationUseContextType | 0 | 1 | 2)[];
	subCommands?: Command[];
	// TODO: Implement argument support

	constructor() {
		if (this.name == "") {
			throw new Error("Command name cannot be empty");
		}

		// Read Commander#addCommand
		if (this.name.includes(" ")) {
			throw new Error("Command name cannot contain spaces");
		}
	}

	execute(_ctx: CommandContext): Promise<void> | void {
	}
}
