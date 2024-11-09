import { emoji } from "emoji";
import {
	ActionRow,
	BotUI,
	Button,
	Command,
	CommandContext,
	Embed,
	fragment,
} from "harmony";

export default class Calculator extends Command {
	override name = "calculator";
	override description = 'Who doesn\'t like a good ol "MTX 8040 Tl 16gb"';
	override aliases = ["calc", "8040tl", "shitty84tl", "math"];
	override usage = "calculator";
	override category = "fun";
	override async execute(ctx: CommandContext) {
		await ctx.message.reply(undefined, {
			embeds: [
				new Embed({
					author: {
						name: "Bidome bot",
						icon_url: ctx.message.client.user!.avatarURL(),
					},
					title: '"MTX 8040 Tl 16gb"',
					description: "```\nPress any button\n```",
					fields: [
						{
							name: "\u200B",
							value: "\u200B",
							inline: true,
						},
						{
							name: "\u200B",
							value: "\u200B",
							inline: true,
						},
						{
							name: "Result",
							value: "`0`",
							inline: true,
						},
					],
					footer: {
						icon_url: ctx.author.avatarURL(),
						text: `Requested by ${ctx.author.tag}`,
					},
				}).setColor("random"),
			],
			components: (
				<>
					{/* ( ) back del */}
					<ActionRow>
						<Button style={"blurple"} label={"("} id={"calc-opa"} />
						<Button style={"blurple"} label={")"} id={"calc-cpa"} />
						<Button
							style={"red"}
							emoji={{ name: emoji("arrow_left") }}
							id={"calc-bck"}
						/>
						<Button
							style={"red"}
							emoji={{ name: emoji("wastebasket") }}
							id={"calc-clr"}
						/>
					</ActionRow>
					{/* 7 8 9 / */}
					<ActionRow>
						<Button
							style={"blurple"}
							emoji={{ name: emoji("seven") }}
							id={"calc-7"}
						/>
						<Button
							style={"blurple"}
							emoji={{ name: emoji("eight") }}
							id={"calc-8"}
						/>
						<Button
							style={"blurple"}
							emoji={{ name: emoji("nine") }}
							id={"calc-9"}
						/>
						<Button
							style={"green"}
							emoji={{
								name: emoji("heavy_division_sign"),
							}}
							id={"calc-div"}
						/>
					</ActionRow>
					{/* 4 5 6 * */}
					<ActionRow>
						<Button
							style={"blurple"}
							emoji={{ name: emoji("four") }}
							id={"calc-4"}
						/>
						<Button
							style={"blurple"}
							emoji={{ name: emoji("five") }}
							id={"calc-5"}
						/>
						<Button
							style={"blurple"}
							emoji={{ name: emoji("six") }}
							id={"calc-6"}
						/>
						<Button
							style={"green"}
							emoji={{
								name: emoji("heavy_multiplication_x"),
							}}
							id={"calc-mul"}
						/>
					</ActionRow>
					{/* 1 2 3 - */}
					<ActionRow>
						<Button
							style={"blurple"}
							emoji={{ name: emoji("one") }}
							id={"calc-1"}
						/>
						<Button
							style={"blurple"}
							emoji={{ name: emoji("two") }}
							id={"calc-2"}
						/>
						<Button
							style={"blurple"}
							emoji={{ name: emoji("three") }}
							id={"calc-3"}
						/>
						<Button
							style={"green"}
							emoji={{ name: emoji("heavy_minus_sign") }}
							id={"calc-sub"}
						/>
					</ActionRow>
					{/*  0 . = + */}
					<ActionRow>
						<Button
							style={"blurple"}
							emoji={{ name: emoji("zero") }}
							id={"calc-0"}
						/>
						<Button
							style={"blurple"}
							emoji={{
								name: emoji("record_button"),
							}}
							id={"calc-dot"}
						/>
						<Button
							style={"blurple"}
							emoji={{ name: emoji("arrow_up") }}
							id={"calc-exp"}
						/>
						<Button
							style={"green"}
							emoji={{ name: emoji("heavy_plus_sign") }}
							id={"calc-add"}
						/>
					</ActionRow>
				</>
			),
		});
	}
}
