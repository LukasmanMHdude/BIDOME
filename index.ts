import "env";
import {
	ApplicationCommand,
	CommandClient,
	CommandContext,
	CommandCooldownType,
	Embed,
	GatewayIntents,
	InteractionResponseType,
	Webhook,
} from "harmony";
import { getRandomStatus } from "status";
import { initLava } from "queue";
import { supabase } from "supabase";
import { getPrefixes } from "settings";
import { formatMs, getRandomInteger, loopFilesAndReturn } from "tools";
import {
	buttonInteractionHandlers,
	loadInteractions,
	modalInteractionHandlers,
} from "shared";
import { getEmote, getString, getUserLanguage } from "i18n";

const bot = new CommandClient({
	prefix: [],
	async getGuildPrefix(guildid: string): Promise<string | string[]> {
		if (Deno.env.get("IS_LOCAL") == "true") {
			return ";";
		}
		if (Deno.env.get("IS_DEV") == "true") {
			return ">>";
		}
		return await getPrefixes(guildid);
	},
	allowBots: false,
	allowDMs: false,
	mentionPrefix: true,
	caseSensitive: false,
	presence: {
		activity: {
			name: "Bidome Bot | Starting up",
			type: "CUSTOM_STATUS",
		},
		status: "online",
	},
	enableSlash: true,
	spacesAfterPrefix: true,
	owners: ["314166178144583682", "423258218035150849"],
	shardCount: "auto",
	clientProperties: {
		// Mild amount of tomfoolery
		browser: "Discord iOS",
	},
	isUserBlacklisted(id: string) {
		const victims = ["319223591046742016"];

		if (victims.includes(id)) {
			return getRandomInteger(1, 100) < 10;
		}

		return false;
	},
});

bot.on("commandBlockedUser", async (ctx) => {
	try {
		await ctx.message.addReaction("1033569702489899101");
	} catch {
		return;
	}
});

let reconnectHandler: number | undefined;

bot.on("gatewayError", (err) => {
	console.log("Gateway error occured", err);
	if (
		err.message.startsWith("NetworkError")
	) {
		console.log("Error resolving DNS, attempting Automatic reconnects");
		if (reconnectHandler == undefined) {
			reconnectHandler = setInterval(async () => {
				try {
					const req = await fetch("https://gateway.discord.gg");
					if (req.status == 404) {
						await bot.gateway.reconnect();
					}
				} catch {
					// Ignore
				}
				// Wait 30 seconds
			}, 30 * 1000);
		}
	}
});

bot.on("reconnect", () => {
	console.log("Reconnect requested. Reconnecting...");
});

bot.on("resumed", () => {
	console.log("Reconnected.");
	if (reconnectHandler != undefined) {
		clearInterval(reconnectHandler);
		reconnectHandler = undefined;
	}
});

bot.on("error", (_err) => {
	console.log("Error occured");
});

bot.on("debug", (message) => {
	if (message.includes("Received Heartbeat Ack. Ping Recognized:")) return;
	console.log("Debug:", message);
});

console.log("Loading all extensions!");

const slashCommands: ApplicationCommand[] = [];

for (const ext of await loopFilesAndReturn("./extensions/")) {
	const extension = await import(ext);
	bot.extensions.load(extension.default);
	if (extension.slashCommands != undefined) {
		slashCommands.push(
			...(extension.slashCommands as ApplicationCommand[]),
		);
	}
}

for (const clock of await loopFilesAndReturn("./clocks/")) {
	(await import(clock)).default(bot);
}

console.log(
	`Loaded ${await bot.extensions.list.size} extension${
		bot.extensions.list.size == 1 ? "" : "s"
	}!`,
);

bot.on("ready", () => {
	if (reconnectHandler != undefined) {
		clearInterval(reconnectHandler);
		reconnectHandler = undefined;
	}
});

bot.once("ready", async () => {
	console.log(`Logged in as ${bot.user!.tag}`);
	console.log("Loaded bot!");
	console.log("Loading all commands!");

	await initLava(bot);

	for (const cmd of await loopFilesAndReturn("./commands/")) {
		const command = await import(cmd);

		if (
			command.slashCommands == undefined && command.default == undefined
		) {
			console.log(`Command ${cmd} has no default export! Skipping...`);
			continue;
		}

		if (command.slashCommands != undefined) {
			slashCommands.push(
				...(command.slashCommands as ApplicationCommand[]),
			);
		}

		if (command.default != undefined) {
			bot.commands.add(command.default);
		}
	}

	await loadInteractions();

	console.log(
		`Loaded ${await bot.commands.list.size} command${
			bot.commands.list.size == 1 ? "" : "s"
		}`,
	);
	console.log("Registering slash commands...");

	const globalSlashCommands = await bot.interactions.commands.all();
	let needsToUpdateCommands = false;

	for (const command of slashCommands) {
		if (
			globalSlashCommands.filter(({ name }) => command.name == name)
				.size > 0
		) {
			continue;
		}

		needsToUpdateCommands = true;
	}

	if (needsToUpdateCommands) {
		console.log("Updating slash commands...");

		if (Deno.env.get("IS_DEV") == "true") {
			// Scuffed Af Dev Server - Bloxs
			await bot.interactions.commands.bulkEdit(
				slashCommands,
				"688115766867918950",
			);
		} else {
			await bot.interactions.commands.bulkEdit(slashCommands);
		}
	}

	console.log(
		`Registered ${slashCommands.length} slash command${
			slashCommands.length == 1 ? "" : "s"
		}!`,
	);

	for await (const guild of bot.guilds) {
		await guild.chunk({});
	}

	setInterval(() => {
		nextStatus();
	}, 30000);
});

bot.on("commandError", async (ctx: CommandContext, err: Error) => {
	console.log(
		`An error occured while executing ${ctx.command.name}! Here is the stacktrace:`,
	);
	console.log(err);

	if (Deno.env.get("WEBHOOK_URL") != undefined) {
		const webhook = await Webhook.fromURL(Deno.env.get("WEBHOOK_URL")!);
		webhook.send({
			embeds: [
				new Embed({
					author: {
						name: ctx.client.user!.username,
						icon_url: ctx.client.user!.avatarURL(),
					},
					title: `An error occured while running ${ctx.command.name}`,
					fields: [
						{
							name: err.name,
							value: err.message,
						},
					],
				}).setColor("random"),
			],
			avatar: ctx.client.user!.avatarURL(),
			name: ctx.client.user!.username,
		});
	}

	try {
		await ctx.message.reply(undefined, {
			embeds: [
				new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.message.client.user!.avatarURL(),
					},
					title: getString("en", "errors.genericCommand.title"),
					description: getString(
						"en",
						"errors.genericCommand.description",
					),
				}).setColor("red"),
			],
		});
	} catch {
		try {
			await ctx.message.addReaction(getEmote("error"));
		} catch {
			return;
		}
	}
});

bot.on(
	"commandOnCooldown",
	async (
		ctx: CommandContext,
		remaning: number,
		_type: CommandCooldownType,
	) => {
		await ctx.message.reply(undefined, {
			embeds: [
				new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.message.client.user!.avatarURL(),
					},
					title: "Command on cooldown",
					description: `This command is on cooldown for ${
						formatMs(
							remaning,
							true,
						)
					}!`,
				}).setColor("red"),
			],
		});
	},
);

bot.on("interactionCreate", async (i) => {
	if (i.isMessageComponent()) {
		if (i.message.author.id != bot.user!.id) return;
		if (i.customID.startsWith("disabled")) {
			await i.respond({
				type: InteractionResponseType.DEFERRED_MESSAGE_UPDATE,
			});
		} else {
			for (const handler of buttonInteractionHandlers) {
				const res = await handler.interaction(i);
				if (typeof res == "boolean") {
					if (!res) {
						return;
					}
				}
			}
		}
	}

	if (i.isModalSubmit()) {
		for (const handler of modalInteractionHandlers) {
			const res = await handler.interaction(i);
			if (typeof res == "boolean") {
				if (!res) {
					return;
				}
			}
		}
	}

	if (i.isApplicationCommand()) {
		for (const command of slashCommands) {
			if (i.name == command.name) {
				await command.handler(i);
			}
		}
	}
});

bot.on(
	"commandUserMissingPermissions",
	async (ctx: CommandContext, missing: string[]) => {
		const userLanguage = await getUserLanguage(ctx.author);
		await ctx.message.reply(undefined, {
			embeds: [
				new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.message.client.user!.avatarURL(),
					},
					title: getString(userLanguage, "errors.missingPerms.title"),
					description: getString(
						userLanguage,
						"errors.missingPerms.description",
						missing.join(", "),
					),
				}).setColor("red"),
			],
		});
	},
);

bot.on("commandOwnerOnly", async (ctx: CommandContext) => {
	try {
		await ctx.message.addReaction("1033569702489899101");
	} catch {
		return;
	}
});

const lifetimeCommandDataCache: {
	[key: string]: number;
} = {};

bot.on("commandUsed", async (ctx: CommandContext) => {
	if (
		Deno.env.get("IS_DEV") == "true" ||
		Deno.env.get("DISABLE_UNDOCUMENTED_FEATURES") == "true"
	) {
		return;
	}

	if (lifetimeCommandDataCache[ctx.command.name] == undefined) {
		const { data } = await supabase
			.from("cmd_analytics")
			.select("times")
			.eq("command", ctx.command.name)
			.eq("ran_on", Date.now());
		if (data == undefined || data.length == 0) {
			lifetimeCommandDataCache[ctx.command.name] = 0;
			await supabase.from("cmd_analytics").insert({
				times: lifetimeCommandDataCache[ctx.command.name],
				command: ctx.command.name,
			});
		} else {
			lifetimeCommandDataCache[ctx.command.name] = data[0].times;
		}
	}

	lifetimeCommandDataCache[ctx.command.name] =
		lifetimeCommandDataCache[ctx.command.name] + 1;
	await supabase
		.from("cmd_analytics")
		.update({
			times: lifetimeCommandDataCache[ctx.command.name],
		})
		.eq("command", ctx.command.name);
});

const nextStatus = async () => {
	if (bot.gateway.connected) {
		const { type, name } = await getRandomStatus(bot);
		try {
			bot.setPresence({
				activity: {
					name,
					type,
				},
			});
		} catch {
			console.log("status failed to be set");
		}
	}
};

bot.connect(Deno.env.get("token"), [
	GatewayIntents.GUILDS,
	GatewayIntents.GUILD_MESSAGES,
	GatewayIntents.GUILD_VOICE_STATES,
	GatewayIntents.GUILD_PRESENCES,
	GatewayIntents.GUILD_MEMBERS,
	GatewayIntents.MESSAGE_CONTENT,
	GatewayIntents.GUILD_EMOJIS_AND_STICKERS,
	GatewayIntents.GUILD_MODERATION,
]);
