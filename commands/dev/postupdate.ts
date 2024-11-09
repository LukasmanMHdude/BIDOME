import {
	Command,
	CommandContext,
	Embed,
	EmbedField,
	isMessageComponentInteraction,
	NewsChannel,
} from "harmony";
import { format } from "tools";

export default class PostUpdate extends Command {
	override name = "postupdate";
	override ownerOnly = true;
	override category = "dev";
	override description = "Post an update to the update channel";
	override async execute(ctx: CommandContext) {
		const message = await ctx.message.reply(undefined, {
			embeds: [
				new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.message.client.user!.avatarURL(),
					},
					title: "Post update",
					description:
						"Please send the update summary you want to post",
					footer: {
						text:
							"Type cancel to cancel and empty to not post a summary",
					},
				}).setColor("random"),
			],
		});

		const [summary] = await ctx.client.waitFor(
			"messageCreate",
			(m) =>
				m.author.id === ctx.message.author.id &&
				m.channel.id === ctx.message.channel.id,
		);

		if (
			summary != undefined && summary.content.toLowerCase() === "cancel"
		) {
			await message.edit(undefined, {
				embeds: [
					new Embed({
						author: {
							name: "Bidome bot",
							icon_url: ctx.message.client.user!.avatarURL(),
						},
						title: "Post update",
						description: "I have cancelled the update post",
					}).setColor("random"),
				],
			});
			return;
		}

		await message.edit(undefined, {
			embeds: [
				new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.message.client.user!.avatarURL(),
					},
					title: "Post update",
					description: "Please send an added feature changelog",
					footer: {
						text:
							"Type cancel to cancel and empty to not post a added feature changelog",
					},
				}).setColor("random"),
			],
		});

		const [addedFeatures] = await ctx.client.waitFor(
			"messageCreate",
			(m) =>
				m.author.id === ctx.message.author.id &&
				m.channel.id === ctx.message.channel.id,
		);

		if (
			addedFeatures != undefined &&
			addedFeatures.content.toLowerCase() === "cancel"
		) {
			await message.edit(undefined, {
				embeds: [
					new Embed({
						author: {
							name: "Bidome bot",
							icon_url: ctx.message.client.user!.avatarURL(),
						},
						title: "Post update",
						description: "I have cancelled the update post",
					}).setColor("random"),
				],
			});
			return;
		}

		await message.edit(undefined, {
			embeds: [
				new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.message.client.user!.avatarURL(),
					},
					title: "Post update",
					description: "Please send a bugfix changelog",
					footer: {
						text:
							"Type cancel to cancel and empty to not post a bugfix changelog",
					},
				}).setColor("random"),
			],
		});

		const [bugfixchangelog] = await ctx.client.waitFor(
			"messageCreate",
			(m) =>
				m.author.id === ctx.message.author.id &&
				m.channel.id === ctx.message.channel.id,
		);

		if (
			bugfixchangelog != undefined &&
			bugfixchangelog.content.toLowerCase() === "cancel"
		) {
			await message.edit(undefined, {
				embeds: [
					new Embed({
						author: {
							name: "Bidome bot",
							icon_url: ctx.message.client.user!.avatarURL(),
						},
						title: "Post update",
						description: "I have cancelled the update post",
					}).setColor("random"),
				],
			});
			return;
		}

		const fields: EmbedField[] = [];

		if (
			addedFeatures != undefined &&
			addedFeatures.content.toLowerCase() !== "empty" &&
			addedFeatures.content !== ""
		) {
			fields.push({
				name: "Added",
				value: addedFeatures.content,
			});
		}

		if (
			bugfixchangelog != undefined &&
			bugfixchangelog.content.toLowerCase() !== "empty" &&
			bugfixchangelog.content !== ""
		) {
			fields.push({
				name: "Fixed",
				value: bugfixchangelog.content,
			});
		}

		const updateEmbed = new Embed({
			title: `New ${
				ctx.argString != "" ? format(ctx.argString) : "Bidome"
			} Update`,
			color: 5814783,
			fields,
			description: summary != undefined &&
					summary.content.toLowerCase() !== "empty" &&
					summary.content !== ""
				? summary.content
				: undefined,
			author: {
				name: ctx.member!.nick ?? ctx.author.username,
				icon_url: ctx.author.avatarURL(),
			},
		});

		const now = Date.now();

		await message.edit(undefined, {
			embeds: [
				new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.message.client.user!.avatarURL(),
					},
					title: "Post update",
					description:
						"Please confirm that you would like to send this embed",
				}).setColor("random"),
				updateEmbed,
			],
			components: [
				{
					type: 1,
					components: [
						{
							type: 2,
							label: "Confirm",
							style: "GREEN",
							customID: `confirm-${now}`,
						},
						{
							type: 2,
							label: "Cancel",
							style: "RED",
							customID: `cancel-${now}`,
						},
					],
				},
			],
		});

		const [button] = await ctx.client.waitFor(
			"interactionCreate",
			(i) =>
				isMessageComponentInteraction(i) &&
				i.member!.id === ctx.member!.id &&
				i.channel!.id === message.channel.id &&
				i.data.custom_id.endsWith(`-${now}`),
		);

		if (
			button == undefined ||
			!isMessageComponentInteraction(button) ||
			(isMessageComponentInteraction(button) &&
				button.customID.startsWith("cancel"))
		) {
			await message.edit(undefined, {
				embeds: [
					new Embed({
						author: {
							name: "Bidome bot",
							icon_url: ctx.message.client.user!.avatarURL(),
						},
						title: "Post update",
						description: "I have cancelled the update post",
					}).setColor("random"),
				],
				components: [],
			});
			return;
		} else {
			const channel = (await ctx.guild!.channels.get(
				"1014029994869129317",
			)) as NewsChannel;

			await channel.send({
				embeds: [updateEmbed],
			});

			await message.edit(undefined, {
				embeds: [
					new Embed({
						author: {
							name: "Bidome bot",
							icon_url: ctx.message.client.user!.avatarURL(),
						},
						title: "Post update",
						description: "I have sent the update post!",
					}).setColor("random"),
				],
				components: [],
			});
		}
	}
}
