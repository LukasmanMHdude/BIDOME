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
	VoiceState,
} from "./harmony.ts";
import { Cluster, Player, PlayerEvents } from "./lavadeno.ts";
import { formatMs, shuffleArray } from "./tools.ts";
import { nodes } from "./nodes.ts";
import { getEmojiByName } from "./emoji.ts";
import { supabase } from "supabase";

let client: CommandClient;

export const queues: Map<string, ServerQueue> = new Map();

export let lavaCluster: Cluster;

export enum LoopType {
	SONG = "song",
	QUEUE = "queue",
	SHUFFLE = "shuffle",
	OFF = "off",
}

export const doPermCheck = async (user: Member, channel: VoiceChannel) => {
	// We do a bit of trolling
	if (client.owners.includes(user.id)) return true;
	if (
		((await channel.voiceStates.array()) ?? []).filter((u) => !u.user.bot)
			.length < 2
	) {
		return true;
	}
	if (user.permissions.has("ADMINISTRATOR")) return true;
	if (channel.guild.ownerID === user.id) return true;
	return false;
};

export class ServerQueue {
	public readonly player: Player;
	public readonly guildId: string;
	public voteSkipUsers: string[] = [];
	public queue: Song[] = [];
	public playedSongQueue: Song[] = [];
	public volume = 100;
	public loop = LoopType.OFF;
	private firstSong = true;
	public queueMessage?: Message;

	constructor(
		public channel: string,
		private guild: Guild,
		channelObject: VoiceChannel,
		setAsSpeaker = false
	) {
		this.guildId = this.guild.id;

		try {
			this.player = lavaCluster.players.resolve(this.guildId)!;
		} catch {
			// Ignore error
		}

		this.player ??= lavaCluster.players.create(this.guildId);
		
		this.player.voice.connect(this.channel, {
			deafened: true,
		});

		this.player.on("trackStart", async () => {
			if (this.queue[0] != undefined) {
				const dbData = {
					server_id: this.guildId,
					started: new Date().toUTCString(),
					name: this.queue[0].title,
					author: this.queue[0].author,
					thumbnail: this.queue[0].thumbnail ?? client.user!.avatarURL(),
					requestedby: this.queue[0].requestedByString,
					length: this.queue[0].msLength,
				};

				if (Deno.env.get("DISABLE_UNDOCUMENTED_FEATURES") != "true") {
					await supabase
						.from("music_notifications")
						.upsert(dbData, {
							onConflict: "server_id",
							ignoreDuplicates: false,
						})
						.select("*");
				}
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
		});

		this.player.voice.on("channelMove", (_, to) => {
			this.channel = to.toString();
		});

		this.player.voice.on("channelLeave", () => {
			this.deleteQueue();
		});

		for (const errorEvent of [
			"trackException",
			"trackStuck",
		] as (keyof PlayerEvents)[]) {
			this.player.on(errorEvent, () => {
				const song = this.queue.shift()!;

				if (this.queueMessage != undefined) {
					this.queueMessage.reply(undefined, {
						embeds: [
							new Embed({
								author: {
									name: "Bidome bot",
									icon_url: client.user!.avatarURL(),
								},
								title: "Song removed",
								description: `An error occured while playing [${song.title}
									](${song.url}) so it has been removed from the queue!`,
							}).setColor("random"),
						],
					});
				}

				if (this.queue.length > 0) {
					this.play();
				} else {
					this.deleteQueue();
				}
			});
		}

		this.player.on("trackEnd", () => {
			this.player.stop({});

			switch (this.loop) {
				case LoopType.SONG: {
					break;
				}
				case LoopType.QUEUE: {
					this.queue.push(this.queue.shift()!);
					break;
				}
				case LoopType.SHUFFLE: {
					this.playedSongQueue.push(this.queue.shift()!);
					this.playedSongQueue = shuffleArray(this.playedSongQueue);

					if (this.queue.length == 0) {
						this.queue = this.playedSongQueue;
						this.playedSongQueue = [];
					}
					break;
				}
				default: {
					this.queue.shift();
					break;
				}
			}

			if (this.queue.length > 0) {
				this.play();
			} else {
				this.deleteQueue();
			}
		});

		queues.set(this.guildId, this);
	}

	public async deleteQueue(admin = false) {
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
		for (const key of [
			"trackStart",
			"trackEnd",
			"trackException",
			"trackStuck",
			"disconnected",
			"channelJoin",
			"channelLeave",
			"channelMove",
		] as (keyof PlayerEvents)[]) {
			this.player.removeAllListeners(key);
		}

		if (this.player.playing) {
			await this.player.stop({});
		}

		this.player.voice.disconnect();

		if (Deno.env.get("DISABLE_UNDOCUMENTED_FEATURES") != "true") {
			await supabase
				.from("music_notifications")
				.delete()
				.eq("server_id", this.guildId);
		}
	}

	private async makeBotSpeak(channelObject: VoiceChannel) {
		const botVoiceState = await channelObject.guild.voiceStates.get(
			client.user!.id
		);
		if (botVoiceState == undefined) return;
		// Unimplemented methods my beloved
		await client.rest.api.guilds[this.guildId]["voice-states"][
			client.user!.id
		].patch({ channel_id: this.channel, suppress: false });
	}

	public addSongs(song: Song | Song[]) {
		const shouldPlay = this.queue.length < 1;
		if (Array.isArray(song)) {
			this.queue.push(...song);
		} else {
			this.queue.push(song);
		}

		if (shouldPlay) {
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

	private async play() {
		if (this.queue.length < 1) return this.deleteQueue();
		this.voteSkipUsers = [];

		const track = this.queue[0];

		await this.player.play(track.track, {
			volume: this.volume,
		});

		if (!this.player.voice.connected) {
			this.player.voice.connect(this.channel, {
				deafened: true,
			});
			this.player.voice.connected = true;
		}
	}

	public get queueLength() {
		let queueLength = 0;

		for (const { msLength } of [...this.queue, ...this.playedSongQueue]) {
			queueLength += msLength;
		}

		return queueLength;
	}

	public get loopType() {
		return {
			[LoopType.SONG]: "Song Loop",
			[LoopType.QUEUE]: "Queue Loop",
			[LoopType.SHUFFLE]: "Shuffle Loop",
			[LoopType.OFF]: "Disabled",
		}[this.loop];
	}

	public get nowPlayingMessage(): AllMessageOptions {
		const song = this.queue[0];

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
					title: "Now Playing",
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
							value: formatMs(song.msLength),
							inline: true,
						},

						{
							name: "Requested by",
							value: `<@!${song.requestedBy}>`,
							inline: true,
						},
						{
							name: "Progress",
							value: `${formatMs(
								(this.player.position ?? 0) < 1000
									? 1000
									: this.player.position!
							)}/${formatMs(song.msLength)}`,
							inline: true,
						},
						{
							name: "Loop Status",
							value: this.loopType,
							inline: true,
						},
					],
					thumbnail: {
						url: song.thumbnail,
					},
					footer: {
						text: `Songs in queue: ${
							this.queue.length + this.playedSongQueue.length
						} | Length: ${formatMs(this.queueLength)}`,
					},
				}).setColor("random"),
			],
			components: (
				<>
					<ActionRow>
						<Button
							style={"grey"}
							emoji={{ name: getEmojiByName("question") }}
							id={"help-song"}
						/>
						<Button
							style={"red"}
							emoji={{
								name: getEmojiByName("black_square_for_stop"),
							}}
							id={"stop-song"}
						/>
						<Button
							style={"blurple"}
							emoji={{ name: getEmojiByName("fast_forward") }}
							id={"skip-song"}
						/>
						<Button
							style={"green"}
							emoji={{
								name: getEmojiByName("twisted_rightwards_arrows"),
							}}
							id={"shuffle-songs"}
						/>
						<Button
							style={"grey"}
							emoji={{
								name: getEmojiByName("arrows_counterclockwise"),
							}}
							id={"refresh-songs"}
						/>
					</ActionRow>
				</>
			),
		};
	}
}

export interface Song {
	title: string;
	author: string;
	url: string;
	msLength: number;
	track: string;
	requestedBy: string;
	requestedByString: string;
	thumbnail?: string;
}

export const initLava = (bot: CommandClient) => {
	client = bot;

	const cluster = new Cluster({
		nodes,
		discord: {
			userId: bot.user!.id,
			sendGatewayCommand: (id, payload) => {
				const shardID = Number(
					(BigInt(id) << 22n) % BigInt(bot.shards.cachedShardCount ?? 1)
				);
				const shard = bot.shards.get(shardID) as Gateway;
				// Harmony's JSR package doesn't export GatewayResponse so I need to use any - Bloxs
				// deno-lint-ignore no-explicit-any
				shard.send(payload as any);
			},
		},
	});
	lavaCluster = cluster;

	cluster.on("nodeConnected", (node, ev) => {
		console.log(
			`[Lavalink] Connected to node ${node.identifier} in ${formatMs(
				ev.took < 1000 ? 1000 : ev.took,
				true
			).toLowerCase()} Reconnected: ${ev.reconnected ? "Yes" : "No"}`
		);
	});

	cluster.on("nodeDisconnected", (node, ev) => {
		console.log(
			`[Lavalink] Disconnected from node ${node.identifier} with code ${ev.code} and reason ${ev.reason}. Attempting to reconnect`
		);
	});

	cluster.on("nodeError", (node, error) => {
		console.log(`[Lavalink] Error on node ${node.identifier}:`, error);
	});

	bot.on("raw", (event, payload) => {
		switch (event) {
			case "VOICE_STATE_UPDATE":
			case "VOICE_SERVER_UPDATE": {
				cluster.players.handleVoiceUpdate(payload);
			}
		}
	});

	cluster.connect({
		userId: bot.user!.id,
	});
};
