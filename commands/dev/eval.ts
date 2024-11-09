import { Command, CommandContext, Embed } from "harmony";
// To be used in eval as an import
// deno-lint-ignore no-unused-vars
import * as harmony from "harmony";

export default class Eval extends Command {
	override name = "eval";
	override ownerOnly = true;
	override category = "dev";
	override aliases = ["execute"];
	override description = "Execute code";
	override usage = "Eval <code>";
	override async execute(ctx: CommandContext) {
		let code = ctx.argString ?? "";
		if (code.startsWith("```ts") || code.startsWith(" ```ts")) {
			code = code.substring(code.split("\n")[0].length, code.length - 3);
		}
		const message = await ctx.message.reply(undefined, {
			embeds: [
				new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.message.client.user!.avatarURL(),
					},
					description: "Executing code!",
				}).setColor("random"),
			],
		});

		let executed: string;

		try {
			executed = `${
				(await eval(`
				(async () => {
					async function _func() {
						${code}
					}

					return await _func();
				})();
			`)) ?? "No output!"
			}`.replace(ctx.client.token!, "lol you thought");
		} catch (e: unknown) {
			const executed = `${e ?? "No output!"}`.replace(
				ctx.client.token!,
				"lol you thought",
			);
			console.log(
				"An error occured while executing the eval command " +
					code +
					"! Error: ",
				e,
			);
			await message.edit(
				new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.message.client.user!.avatarURL(),
					},
					title: "Error occured while executing!",
					description: `${
						executed.length > 2000 - 10
							? "Output too long to send!"
							: "```ts\n" + executed + "\n```"
					}`,
				}).setColor("random"),
			);
			return;
		}

		if (executed != undefined) {
			console.log("Output from command " + code + ", ", executed!);
			await message.edit(
				new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.message.client.user!.avatarURL(),
					},
					title: "Executed code",
					description: `${
						executed!.length > 2000 - 10
							? "Output too long to send!"
							: "```ts\n" + executed + "\n```"
					}`,
				}).setColor("random"),
			);
		}
	}
}
