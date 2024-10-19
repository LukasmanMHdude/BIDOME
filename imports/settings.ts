import { Database, supabase } from "./supabase.ts";
import { Guild } from "./harmony.ts";

type DatabaseTable = Database["public"]["Tables"];
type ServerTable = DatabaseTable["servers"]["Row"];
type ReminderTable = DatabaseTable["reminders"]["Row"];

export enum Feature {
	BETTER_EMOTES = "better_emotes",
	SUGGESTIONS = "suggestions",
}

export type GuildConfig = {
	enabledBetaFeatures: (Feature)[];
	enabledFeatures: (Feature | typeof Feature)[];
	suggestion_channel: string | null;
	suggestion_accepted_channel: string | null;
	suggestion_denied_channel: string | null;
	djRole: string | null;
};

export const defaultGuildConfig: GuildConfig = {
	enabledBetaFeatures: [],
	enabledFeatures: [],
	suggestion_channel: null,
	suggestion_accepted_channel: null,
	suggestion_denied_channel: null,
	djRole: null,
};

export const serverSettings: {
	[guildId: string]: Partial<ServerTable>;
} = {};

export let reminders: ReminderTable[] =
	(await supabase.from("reminders").select("*")).data ?? [];

// Prefix
export const getPrefixes = async (guildId: string | Guild) => {
	if (guildId instanceof Guild) guildId = guildId.id;
	if (serverSettings[guildId]?.prefix != undefined) {
		return serverSettings[guildId].prefix!;
	}

	const { data } = await supabase
		.from("servers")
		.select("prefix")
		.eq("server_id", guildId)
		.limit(1)
		.single();

	if (data != undefined) {
		serverSettings[guildId] ??= {};
		serverSettings[guildId].prefix = data.prefix;
		return data.prefix;
	} else {
		await supabase.from("servers").insert({ server_id: guildId });
		return ["!"];
	}
};

export const setPrefixes = async (guildId: string, prefixes: string[]) => {
	await supabase
		.from("servers")
		.update({
			prefix: prefixes,
		})
		.eq("server_id", guildId);
	serverSettings[guildId] ??= {};
	serverSettings[guildId].prefix = prefixes;
};

export const addPrefix = async (guildId: string, prefix: string) => {
	const prefixes = await getPrefixes(guildId);
	if (prefixes.includes(prefix)) return;
	prefixes.push(prefix);
	await setPrefixes(guildId, prefixes);
};

export const removePrefix = async (guildId: string, prefix: string) => {
	const prefixes = await getPrefixes(guildId);
	if (!prefixes.includes(prefix)) return;
	prefixes.splice(prefixes.indexOf(prefix), 1);
	await setPrefixes(guildId, prefixes);
};

supabase
	.channel("public:servers")
	.on(
		"postgres_changes",
		{
			event: "*",
			schema: "public",
			table: "servers",
		},
		(payload) => {
			switch (payload.eventType) {
				case "DELETE": {
					const data = payload.old;
					delete serverSettings[data.server_id];
					break;
				}

				case "INSERT":
				case "UPDATE": {
					const data = payload.new;
					serverSettings[data.server_id] = data;
					break;
				}
			}
		},
	)
	.subscribe();

// Reminders
let currentReminderId = 0;

export const getReminders = (user?: string) => {
	if (user == undefined) return reminders;
	return reminders.filter((r) => r.user_id == user);
};

export const createReminder = async (
	payload: DatabaseTable["reminders"]["Insert"],
): Promise<number> => {
	const { data } = await supabase
		.from("reminders")
		.insert(payload)
		.select("id");

	if (currentReminderId < data![0].id) {
		currentReminderId = data![0].id;
	} else {
		currentReminderId++;
	}

	return parseInt(currentReminderId.toString());
};

export const removeReminder = async (id: string | number) => {
	id = id.toString();
	await supabase.from("reminders").delete().eq("id", id);
	reminders = reminders.filter((r) => r.id.toString() != id);
};

supabase
	.channel("public:reminders")
	.on<ReminderTable>(
		"postgres_changes",
		{
			event: "*",
			schema: "public",
			table: "reminders",
		},
		(payload) => {
			switch (payload.eventType) {
				case "DELETE": {
					const id = payload.old!.id;
					reminders = reminders.filter((r) => r.id != id);
					break;
				}

				case "INSERT": {
					reminders.push(payload.new!);
					break;
				}

				case "UPDATE": {
					const id = payload.new!.id;
					reminders = reminders.filter((r) => r.id != id);
					reminders.push(payload.new!);
					break;
				}
			}
		},
	)
	.subscribe();

// Suggestions
export const getSuggestionChannels = async (guildId: string | Guild) => {
	if (guildId instanceof Guild) guildId = guildId.id;
	if (
		serverSettings[guildId]?.suggestion_channel != undefined ||
		serverSettings[guildId]?.suggestion_accepted_channel != undefined ||
		serverSettings[guildId]?.suggestion_denied_channel != undefined
	) {
		return {
			suggestion_channel: serverSettings[guildId].suggestion_channel,
			suggestion_accepted_channel:
				serverSettings[guildId].suggestion_accepted_channel,
			suggestion_denied_channel:
				serverSettings[guildId].suggestion_denied_channel,
		};
	}

	const { data } = await supabase
		.from("servers")
		.select("*")
		.eq("server_id", guildId)
		.limit(1)
		.single();

	if (data != undefined) {
		serverSettings[guildId] ??= {};
		serverSettings[guildId].suggestion_channel = data.suggestion_channel;
		serverSettings[guildId].suggestion_accepted_channel =
			data.suggestion_accepted_channel;
		serverSettings[guildId].suggestion_denied_channel =
			data.suggestion_denied_channel;
		return {
			suggestion_channel: data.suggestion_channel,
			suggestion_accepted_channel: data.suggestion_accepted_channel,
			suggestion_denied_channel: data.suggestion_denied_channel,
		};
	} else {
		await supabase.from("servers").insert({ server_id: guildId });
		return {
			suggestion_channel: undefined,
			suggestion_accepted_channel: undefined,
			suggestion_denied_channel: undefined,
		};
	}
};

// Betas
export const hasNQNBeta = async (guildId: Guild | string) => {
	if (guildId instanceof Guild) guildId = guildId.id;
	if (serverSettings[guildId]?.free_nitro_emotes != undefined) {
		return serverSettings[guildId].free_nitro_emotes!;
	}

	const { data } = await supabase
		.from("servers")
		.select("free_nitro_emotes")
		.eq("server_id", guildId)
		.limit(1)
		.single();

	if (data != undefined) {
		serverSettings[guildId] ??= {};
		serverSettings[guildId].free_nitro_emotes = data.free_nitro_emotes;
		return data.free_nitro_emotes;
	} else {
		await supabase.from("servers").insert({ server_id: guildId });
		return false;
	}
};

export const setNQNBeta = async (guildId: Guild | string, value: boolean) => {
	if (guildId instanceof Guild) guildId = guildId.id;
	serverSettings[guildId].free_nitro_emotes = value;
	await supabase
		.from("servers")
		.update({ free_nitro_emotes: value })
		.eq("server_id", guildId);
};

// Config
export const getConfig = async (guildId: Guild | string) => {
	if (guildId instanceof Guild) guildId = guildId.id;
	if (serverSettings[guildId]?.config != undefined) {
		return serverSettings[guildId].config as GuildConfig;
	}

	const { data } = await supabase
		.from("servers")
		.select("config")
		.eq("server_id", guildId)
		.limit(1)
		.single();

	if (data == undefined) {
		await supabase
			.from("servers")
			.insert({ server_id: guildId, config: defaultGuildConfig });
		serverSettings[guildId] ??= {};
		serverSettings[guildId].config = defaultGuildConfig;
		return defaultGuildConfig;
	}

	serverSettings[guildId] ??= {};
	serverSettings[guildId].config = data.config;

	return {
		...defaultGuildConfig,
		...(data.config as GuildConfig),
	};
};

export const setConfigValues = async (
	guildId: Guild | string,
	config: Partial<GuildConfig>,
) => {
	if (guildId instanceof Guild) guildId = guildId.id;

	const currentConfig = await getConfig(guildId);
	const newConfig = {
		...currentConfig,
		...config,
	};

	serverSettings[guildId].config = newConfig;

	await supabase
		.from("servers")
		.update({ config: newConfig })
		.eq("server_id", guildId);
};
