import {
	ActionRow,
	BotUI,
	Button,
	Command,
	CommandContext,
	Embed,
	fragment,
	isMessageComponentInteraction,
} from "harmony";
import { doPermCheck, lavaCluster, queues, ServerQueue, Song } from "queue";
import { Track } from "lavadeno";
import { getEmojiByName } from "emoji";
import { shuffleArray } from "tools";
import { getEmote } from "i18n";
import { load } from "https://deno.land/std@0.186.0/yaml/_loader/loader.ts";

const shuffleCommands = ["shuffleplay", "sp"];

export default class Play extends Command {
	name = "play";
	aliases = ["p", "enqueue", "add", ...shuffleCommands];
	category = "music";
	description = "Play a song";
	usage = ["play <song query or URL>", "shuffleplay <playlist URL>"];

	async execute(ctx: CommandContext) {
		if (ctx.guild == undefined) return;
		if (ctx.argString == "") {
			await ctx.message.reply(undefined, {
				embeds: [
					new Embed({
						author: {
							name: "Bidome bot",
							icon_url: ctx.client.user!.avatarURL(),
						},
						title: "Missing arguments",
						description: "Please provide a song to play!",
					}).setColor("random"),
				],
			});
		} else {
			const botState = await ctx.guild!.voiceStates.get(ctx.client.user!.id);
			if (
				queues.has(ctx.guild!.id) &&
				(botState == undefined || botState.channel == undefined)
			) {
				queues.get(ctx.guild!.id)!.deleteQueue();
			}

			const vc = await ctx.guild!.voiceStates.get(ctx.author.id);
			if (vc == undefined || vc.channel == undefined) {
				await ctx.message.reply(undefined, {
					embeds: [
						new Embed({
							author: {
								name: "Bidome bot",
								icon_url: ctx.client.user!.avatarURL(),
							},
							title: "Unable to play",
							description: "Please join a voice channel before playing!",
						}).setColor("red"),
					],
				});
			} else {
				const message = await ctx.message.reply(undefined, {
					embeds: [
						new Embed({
							author: {
								name: "Bidome bot",
								icon_url: ctx.client.user!.avatarURL(),
							},
							title: "Searching for songs",
							description: `${getEmote("typing")} Searching`,
						}).setColor("random"),
					],
				});

				const isLink =
					/(https?:\/\/)?(www\.)?([a-zA-Z0-9][a-zA-Z0-9\-]{1,}[a-zA-Z0-9]\.?){1,}(\.[a-zA-Z]{2})?\.[a-zA-Z]{2,63}/i.test(
						ctx.argString
					);

				const searchString =
					isLink || /(yt|sc)search\:/i.test(ctx.argString)
						? ctx.argString
						: `ytsearch:${ctx.argString}`;

				const { data, loadType } = await lavaCluster.api.loadTracks(
					searchString
				);

				if (loadType == "error" || loadType == "empty") {
					await message.edit(undefined, {
						embeds: [
							new Embed({
								author: {
									name: "Bidome bot",
									icon_url: ctx.client.user!.avatarURL(),
								},
								title: "Unable to find songs!",
								description: "No songs were found for that result!",
							}).setColor("red"),
						],
					});
				} else {
					const songsToAdd: Song[] = [];

					const addTrackData = (trackInfo: Track) => {
						const {
							info: { title, author, uri, length },
							track,
						} = trackInfo;

						let thumbnail: undefined | string = undefined;

						if (uri.toLowerCase().startsWith("https://www.youtube.com/")) {
							const videoID = uri.substring(uri.indexOf("=") + 1);
							thumbnail = `https://img.youtube.com/vi/${videoID}/hqdefault.jpg`;
						}

						songsToAdd.push({
							title,
							author,
							url: uri,
							msLength: length,
							track,
							requestedBy: ctx.author.id,
							thumbnail,
							requestedByString: ctx.author.tag,
						});
					};

					if (isLink) {
						switch (loadType) {
							case "playlist": {
								if (
									shuffleCommands.includes(
										ctx.message.content
											.substring(ctx.prefix.length)
											.trim()
											.split(" ")[0]
									)
								) {
									const tracks: Track[] = [];

									for (const track of data.tracks) {
										tracks.push({
											info: {
												author: track.info.author,
												identifier: track.info.identifier,
												isSeekable: track.info.isSeekable,
												isStream: track.info.isStream,
												length: track.info.length,
												position: track.info.position,
												sourceName: track.info.sourceName,
												title: track.info.title,
												uri: track.info.uri!,
											},
											track: track.encoded,
										});
									}

									const shuffledTracks = shuffleArray(tracks);

									for (const track of shuffledTracks) {
										addTrackData(track);
									}
								} else {
									for (const track of data.tracks) {
										addTrackData({
											info: {
												author: track.info.author,
												identifier: track.info.identifier,
												isSeekable: track.info.isSeekable,
												isStream: track.info.isStream,
												length: track.info.length,
												position: track.info.position,
												sourceName: track.info.sourceName,
												title: track.info.title,
												uri: track.info.uri!,
											},
											track: track.encoded,
										});
									}
								}
								break;
							}

							case "track": {
								addTrackData({
									info: {
										author: data.info.author,
										identifier: data.info.identifier,
										isSeekable: data.info.isSeekable,
										isStream: data.info.isStream,
										length: data.info.length,
										position: data.info.position,
										sourceName: data.info.sourceName,
										title: data.info.title,
										uri: data.info.uri!,
									},
									track: data.encoded,
								});
								break;
							}
						}
					} else {
						if (loadType != "search") {
							throw new Error("Invalid load type");
						}

						const now = Date.now();

						const emojiMap = {
							0: getEmojiByName("one"),
							1: getEmojiByName("two"),
							2: getEmojiByName("three"),
							3: getEmojiByName("four"),
							4: getEmojiByName("five"),
						};

						await message.edit(undefined, {
							embeds: [
								new Embed({
									author: {
										name: "Bidome bot",
										icon_url: ctx.client.user!.avatarURL(),
									},
									title: "Please select an option",
									description: data
										.slice(0, 5)
										.map(
											(track, i) =>
												`${emojiMap[i as 0 | 1 | 2 | 3 | 4]} - [${
													track.info.title
												}](${track.info.uri})`
										)
										.join("\n"),
									footer: {
										text: "This message will time out in 30 seconds!",
									},
								}).setColor("red"),
							],
							components: (
								<>
									<ActionRow>
										{data.slice(0, 5).map((_, i) => (
											<Button
												style={"blurple"}
												emoji={{
													name: emojiMap[i as 0 | 1 | 2 | 3 | 4],
												}}
												id={`${now}-${i.toString()}`}
											/>
										))}
									</ActionRow>
									<ActionRow>
										<Button
											style={"red"}
											label={"Cancel"}
											id={`${now}-cancel`}
										/>
									</ActionRow>
								</>
							),
						});

						const [response] = await ctx.client.waitFor(
							"interactionCreate",
							(i) =>
								isMessageComponentInteraction(i) &&
								i.user.id == ctx.author.id &&
								i.channel!.id == ctx.channel.id &&
								i.message.id == message.id,
							30 * 1000
						);

						if (
							response == undefined ||
							!isMessageComponentInteraction(response) ||
							response.customID == `${now}-cancel`
						) {
							await message.edit(undefined, {
								embeds: [
									new Embed({
										author: {
											name: "Bidome bot",
											icon_url: ctx.client.user!.avatarURL(),
										},
										title: "Selection canceled",
										description: "No songs were selected!",
									}).setColor("red"),
								],
								components: [],
							});
							return;
						} else {
							const [_, selected] = response.customID.split("-");
							const selectedTrack = data[parseInt(selected)];
							addTrackData({
								info: {
									author: selectedTrack.info.author,
									identifier: selectedTrack.info.identifier,
									isSeekable: selectedTrack.info.isSeekable,
									isStream: selectedTrack.info.isStream,
									length: selectedTrack.info.length,
									position: selectedTrack.info.position,
									sourceName: selectedTrack.info.sourceName,
									title: selectedTrack.info.title,
									uri: selectedTrack.info.uri!,
								},
								track: selectedTrack.encoded,
							});
						}
					}

					const isNewQueue = queues.has(ctx.guild.id);
					const queue: ServerQueue = isNewQueue
						? queues.get(ctx.guild.id)!
						: new ServerQueue(
								vc.channel.id,
								ctx.guild,
								vc.channel,
								await doPermCheck(ctx.member!, vc.channel)
						  );

					if (songsToAdd.length > 1) {
						await message.edit(undefined, {
							embeds: [
								new Embed({
									author: {
										name: "Bidome bot",
										icon_url: ctx.client.user!.avatarURL(),
									},
									title: "Enqueued songs",
									description: `Added ${songsToAdd.length} song${
										songsToAdd.length > 1 ? "s" : ""
									} to the queue!`,
									footer: {
										text: `Songs in queue: ${
											queue.queue.length +
											songsToAdd.length +
											queue.playedSongQueue.length
										}`,
									},
								}).setColor("random"),
							],
							components: [],
						});
					} else {
						await message.edit(undefined, {
							embeds: [
								new Embed({
									author: {
										name: "Bidome bot",
										icon_url: ctx.client.user!.avatarURL(),
									},
									title: "Enqueued song",
									description: `Added [${songsToAdd[0].title}](${songsToAdd[0].url}) to the queue!`,
									footer: {
										text: `Songs in queue: ${
											queue.queue.length + 1 + queue.playedSongQueue.length
										}`,
									},
								}).setColor("random"),
							],
							components: [],
						});
					}

					queue.addSongs(songsToAdd);

					if (queue.queueMessage == undefined) {
						queue.queueMessage = await ctx.channel.send(
							queue.nowPlayingMessage
						);
					}
				}
			}
		}
	}
}
