import type { ArgsBuilder } from "./args.ts";

export interface CommandOptions {
	// General Command Options
	name: string;
	/** Command Category */
	category?: string;
	/** Command Description */
	description?: string;
	/** Command Aliases */
	aliases?: string[];
	/** Command Usage */
	usage?: string[];
	/** Command Usage Examples */
	examples?: string[];
	/** Command Arguments */
	disabled?: boolean;
	/** Command Arguments */
	hidden?: boolean;
	/** Command can only be run via slash */
	slashOnly?: boolean;
	/** Command can only be run via text*/
	textOnly?: boolean;
	/** Allow use in DMs */
	allowDMs?: boolean;
	/** Command can only be run via DM (requires allowDMs) */
	dmOnly?: boolean;

	// Args
	/** Command Arguments */
	args?: ArgsBuilder;

	// Permissions
	/** Required bot permissions */
	botPerms?: string[];
	/** Required user permissions */
	userPerms?: string[];

	// Owner
	/** Only the owner can use this command */
	ownerOnly?: boolean;
	/** This command can only be used in the owner guild */
	ownerGuildOnly?: boolean;
	/** The owner bypasses command cooldowns */
	ownerBypassesCooldown?: boolean;
	/** The owner bypasses permission requirements */
	ownerBypassesPerms?: boolean;

	// Cooldown
	/** Global command cooldown */
	cooldown?: number;
	/** User command cooldown */
	userCooldown?: number;
	/** Guild command cooldown */
	guildCooldown?: number;
	/** Channel command cooldown */
	channelCooldown?: number;
}

export class Command implements CommandOptions {
	name = "";

	async execute() {
	}
}
