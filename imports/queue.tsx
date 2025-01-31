import {
	ActionRow,
	AllMessageOptions,
	BotUI,
	Button,
	ChannelTypes,
	CommandClient,
	Embed,
	fragment,
	Gateway,
	Guild,
	Member,
	Message,
	VoiceChannel,
	type VoiceState,
} from "./harmony.ts";
import { LilyManager, LilyPlayer, type LilyTrack } from "./lavadeno.ts";
import { formatMs } from "./tools.ts";
import { emoji } from "./emoji.ts";
import { getConfig } from "./settings.ts";

export let client: CommandClient;

export const queues: Map<string, ServerQueue> = new Map();

const nodesCount = parseInt(Deno.env.get("LAVALINK_NODES")!);

if (isNaN(nodesCount)) {
	throw new Error("Invalid node count");
}

export const nodes = new LilyManager({
	nodes: new Array(nodesCount).fill(undefined).map((_, i) => ({
		host: Deno.env.get(`LAVALINK_${i + 1}_HOST`)!,
		port: parseInt(Deno.env.get(`LAVALINK_${i + 1}_PORT`)!),
		password: Deno.env.get(`LAVALINK_${i + 1}_PASSWORD`)!,
		secure: Deno.env.get(`LAVALINK_${i + 1}_SECURE`) == "true",
		identifier: Deno.env.get(`LAVALINK_${i + 1}_NAME`)!,
		retryDelay: 60 * 1000,
	})),
	options: {
		clientName: "Bidome/1.0.0",
	},
	sendPayload: async (guildID: string, payload: unknown) => {
		const guild = await client.guilds.resolve(guildID);
		if (guild == undefined) return;
		const shard = client.shards.get(guild.shardID) as Gateway;
		// deno-lint-ignore no-explicit-any
		shard.send(JSON.parse(payload as any));
	},
});

export const playerEventHandlers = new Map<
	string,
	{
		trackStart: (track: LilyTrack) => Promise<void> | void;
		playerMoved: (
			oldChannel: string,
			newChannel: string,
		) => Promise<void> | void;
		playerDisconnected: () => Promise<void> | void;
	}
>();

nodes.on("trackStart", async (player, track) => {
	const handlers = playerEventHandlers.get(player.guildId);
	if (handlers != undefined) {
		await handlers.trackStart(track);
	}
});

nodes.on("playerMoved", async (player, oldChannel, newChannel) => {
	const handlers = playerEventHandlers.get(player.guildId);
	if (handlers != undefined) {
		await handlers.playerMoved(oldChannel, newChannel);
	}
});

nodes.on("playerDisconnected", (player) => {
	const handlers = playerEventHandlers.get(player.guildId);
	queues.get(player.guildId)?.deleteQueue();
	if (handlers != undefined) {
		handlers.playerDisconnected();
	}
});

export const doPermCheck = async (user: Member, channel: VoiceChannel) => {
	// We do a bit of trolling
	if (client.owners.includes(user.id)) return true;
	if (user.permissions.has("ADMINISTRATOR")) return true;
	if (channel.guild.ownerID === user.id) return true;

	const users = ((await channel.voiceStates.array()) ?? []).filter(
		(u) => !u.user.bot,
	);
	if (!users.map((u) => u.user.id).includes(user.id)) return false;
	if (users.length < 2) {
		return true;
	}
	const serverConfig = await getConfig(channel.guild);

	if (serverConfig.djRole != undefined) {
		const hasRole = await user.roles.resolve(serverConfig.djRole);
		return hasRole != undefined;
	}

	return false;
};

export class ServerQueue {
	public readonly player: LilyPlayer;
	public readonly guildId: string;
	public voteSkipUsers: string[] = [];
	public volume = 100;
	private firstSong = true;
	public queueMessage?: Message;

	constructor(
		public channel: string,
		private guild: Guild,
		channelObject: VoiceChannel,
		setAsSpeaker = false,
	) {
		this.guildId = this.guild.id;

		try {
			this.player = nodes.players.get(this.guildId)!;
		} catch {
			// Ignore error
		}

		this.player ??= nodes.players.create({
			guildId: this.guildId,
			voiceChannelId: channelObject.id,
			textChannelId: channel,
			autoLeave: true,
		})!;

		this.player.connect({
			setDeaf: true,
		});

		playerEventHandlers.set(this.guildId, {
			playerDisconnected: () => {
				this.deleteQueue();
			},
			playerMoved: (_, newChannel) => {
				this.channel = newChannel;
			},
			trackStart: async () => {
				if (!this.player.connected) {
					this.player.connect({
						setDeaf: true,
					});
				}

				if (setAsSpeaker && this.firstSong) {
					if (channelObject.type == ChannelTypes.GUILD_STAGE_VOICE) {
						this.makeBotSpeak(channelObject);
					}
				}

				this.voteSkipUsers = [];

				if (this.queueMessage != undefined) {
					if (this.firstSong) {
						this.firstSong = false;
					} else {
						await this.queueMessage.edit(this.nowPlayingMessage);
					}
				}
			},
		});

		queues.set(this.guildId, this);
	}

	public async deleteQueue(admin = false) {
		if (queues.has(this.guildId)) {
			if (this.queueMessage != undefined) {
				await this.queueMessage.edit({
					embeds: [
						new Embed({
							author: {
								name: "Bidome bot",
								icon_url: client.user!.avatarURL(),
							},
							title: "Finished queue",
							description: admin
								? "I have stopped the player"
								: "I have finished playing this queue",
						}).setColor("random"),
					],
					components: [],
				});
			}
			queues.delete(this.guildId);
			playerEventHandlers.delete(this.guildId);

			this.player.queue.clear();
			this.player.disconnect();
			this.player.destroy();
		}
	}

	private async makeBotSpeak(channelObject: VoiceChannel) {
		const botVoiceState = await channelObject.guild.voiceStates.get(
			client.user!.id,
		);
		if (botVoiceState == undefined) return;
		// Unimplemented methods my beloved
		await client.rest.api.guilds[this.guildId]["voice-states"][
			client.user!.id
		].patch({ channel_id: this.channel, suppress: false });
	}

	public addSongs(songs: LilyTrack | LilyTrack[]) {
		if (Array.isArray(songs)) {
			for (const song of songs) {
				this.player.queue.add(song);
			}
		} else {
			this.player.queue.add(songs);
		}

		if (!this.player.playing) {
			this.play();
		}
	}

	public canSkip(voiceMembers: VoiceState[]) {
		const skippingUsers = [];

		for (const member of voiceMembers) {
			if (this.voteSkipUsers.includes(member.user.id)) {
				skippingUsers.push(member.user.id);
			}
		}

		return (
			voiceMembers.length < 2 ||
			skippingUsers.length >= Math.floor(voiceMembers.length / 2) + 1
		);
	}

	private play() {
		// if (this.player.queue.size < 1) return this.deleteQueue();
		this.voteSkipUsers = [];

		if (!this.player.playing) {
			this.player.play();
		}
	}

	public get queueLength() {
		let queueLength = 0;

		for (
			const { duration } of [
				this.player.current,
				...this.player.queue.values(),
			].filter((song) => song != undefined)
		) {
			queueLength += duration;
		}

		return queueLength;
	}

	public get nowPlayingMessage(): AllMessageOptions {
		const song = this.player.current;

		if (song == undefined) {
			return {
				embeds: [
					new Embed({
						author: {
							name: "Bidome bot",
							icon_url: client.user!.avatarURL(),
						},
						title: "No songs in queue",
						description: "Why don't you add some?",
					}).setColor("random"),
				],
				components: [],
			};
		}

		return {
			embeds: [
				new Embed({
					author: {
						name: "Bidome bot",
						icon_url: client.user!.avatarURL(),
					},
					title: `Now Playing`,
					fields: [
						{
							name: "Song",
							value: `[${song.title}](${song.url})`,
							inline: true,
						},
						{
							name: "Author",
							value: song.author,
							inline: true,
						},
						{
							name: "Length",
							value: formatMs(song.duration),
							inline: true,
						},

						{
							name: "Requested by",
							value: `<@!${song.requestedBy}>`,
							inline: true,
						},
						{
							name: "Progress",
							value: `${
								formatMs(
									(this.player.current!.position ?? 0) < 1000
										? 1000
										: this.player.current!.position!,
								)
							}/${formatMs(song.duration)}`,
							inline: true,
						},
						{
							name: "Loop Status",
							value: {
								off: "Off",
								track: "Song",
								queue: "Queue",
							}[this.player.loop],
							inline: true,
						},
					],
					thumbnail: {
						url: song.artworkUrl,
					},
					footer: {
						text: `Songs in queue: ${
							this.player.queue.size + 1
						} | Length: ${formatMs(this.queueLength)}`,
					},
				}).setColor("random"),
			],
			components: (
				<>
					<ActionRow>
						<Button
							style={"grey"}
							emoji={{ name: emoji("question") }}
							id={"help-song"}
						/>
						<Button
							style={"red"}
							emoji={{
								name: emoji("stop_button"),
							}}
							id={"stop-song"}
						/>
						<Button
							style={"blurple"}
							emoji={{ name: emoji("fast_forward") }}
							id={"skip-song"}
						/>
						<Button
							style={"green"}
							emoji={{
								name: emoji("twisted_rightwards_arrows"),
							}}
							id={"shuffle-songs"}
						/>
						<Button
							style={"grey"}
							emoji={{
								name: emoji("arrows_counterclockwise"),
							}}
							id={"refresh-songs"}
						/>
					</ActionRow>
				</>
			),
		};
	}
}

export const initLava = (bot: CommandClient) => {
	client = bot;

	nodes.on("nodeCreate", (node) => {
		console.log(`[Lavalink] Created node ${node.identifier}`);
	});

	nodes.on("nodeConnected", (node) => {
		console.log(`[Lavalink] Connected to node ${node.identifier}`);
	});

	nodes.on("nodeDisconnect", (node, code, reason) => {
		console.log(
			`[Lavalink] Disconnected from node ${node.identifier} with code ${code} and reason ${reason}. Attempting to reconnect`,
		);
	});

	nodes.on("nodeError", (node, error) => {
		console.log(`[Lavalink] Error on node ${node.identifier}:`, error);
	});

	console.log("[Lavalink] Initializing nodes");

	bot.on("raw", (evt, payload) => {
		if (!["VOICE_STATE_UPDATE", "VOICE_SERVER_UPDATE"].includes(evt)) {
			return;
		}
		// The full payload is simulated because harmony strips it for some reason
		nodes.packetUpdate({
			t: evt as "VOICE_STATE_UPDATE" | "VOICE_SERVER_UPDATE",
			d: payload,
		});
	});

	nodes.init(bot.user!.id);
};
