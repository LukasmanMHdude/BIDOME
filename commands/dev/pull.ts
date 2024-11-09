import { Command, CommandContext, Embed } from "harmony";

export default class Pull extends Command {
	override name = "pull";
	override aliases = ["ghpull", "githubpull"];
	override description = "Pull the latest changes from the repository";
	override category = "dev";
	override usage = "pull";
	override ownerOnly = true;
	override async execute(ctx: CommandContext) {
		const message = await ctx.message.reply(undefined, {
			embeds: [
				new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.message.client.user!.avatarURL(),
					},
					title: "Bidome github",
					description: `Pulling changes...`,
				}).setColor("random"),
			],
		});

		const outputs = [];

		for (
			const gitcmd of [
				"git fetch",
				`git reset --hard origin/${
					Deno.env.get("GH_BRANCH") ?? "master"
				}`,
			]
		) {
			const git = new Deno.Command(gitcmd.split(" ")[0], {
				stdout: "piped",
				args: gitcmd.split(" ").slice(1),
			});
			outputs.push(await git.output());
		}

		const strings = [];
		for (const output of outputs) {
			strings.push(new TextDecoder().decode(output.stdout));
		}

		await message.edit(undefined, {
			embeds: [
				new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.message.client.user!.avatarURL(),
					},
					title: "Bidome github",
					description: `Pulled changes with output: \`\`\`${
						strings.join(
							"\n",
						)
					}\`\`\``,
				}).setColor("random"),
			],
		});
	}
}
