import {
	Embed,
	InteractionResponseType,
	MessageComponentInteraction,
} from "harmony";

export async function button(i: MessageComponentInteraction) {
	if (i.customID.startsWith("calc")) {
		if (
			i.message.embeds[0]
				.footer!.icon_url!.split("/avatars/")[1]
				.split("/")[0] === i.user.id
		) {
			let previousInputs = i.message.embeds[0]
				.description!.split("\n")[1]
				.replace("Press any button", "");
			let solution = null;

			switch (i.customID.substring("calc-".length)) {
				case "bck": {
					previousInputs = previousInputs.substring(
						0,
						previousInputs.length - 1,
					);
					break;
				}

				case "clr": {
					previousInputs = " ";
					break;
				}

				case "div": {
					previousInputs += "/";
					break;
				}

				case "mul": {
					previousInputs += "*";
					break;
				}

				case "sub": {
					previousInputs += "-";
					break;
				}

				case "add": {
					previousInputs += "+";
					break;
				}

				case "dot": {
					previousInputs += ".";
					break;
				}

				// OOPA! *crashes discord*
				case "opa": {
					previousInputs += "(";
					break;
				}

				case "cpa": {
					previousInputs += ")";
					break;
				}

				case "exp": {
					previousInputs += "^";
					break;
				}

				default: {
					previousInputs += i.customID.substring("calc-".length);
				}
			}

			const allowedChars = "0123456789.+-*/^()";

			try {
				// This would be a security hazard but it's limited to numbers and operators
				solution = eval(
					previousInputs
						.split("")
						.filter((c) => allowedChars.includes(c))
						.join("")
						.replace(/\^/g, "**"),
				);
			} catch {
				solution = "Error";
			}

			previousInputs = previousInputs.trim() == ""
				? "Press any button"
				: previousInputs;

			await i.message.edit(undefined, {
				embeds: [
					new Embed({
						...i.message.embeds[0].toJSON(),
						description: "```\n" + previousInputs.trim() + "\n```",
						fields: [
							{
								name: "\u200B",
								value: "\u200B",
								inline: true,
							},
							{
								name: "\u200B",
								value: "\u200B ",
								inline: true,
							},
							{
								name: "Result",
								value: "`" +
									(solution == null ? "0" : solution) + "`",
								inline: true,
							},
						],
					}).setColor("random"),
				],
				components: i.message.components,
			});
			await i.respond({
				type: InteractionResponseType.DEFERRED_MESSAGE_UPDATE,
			});
		} else {
			await i.respond({
				ephemeral: true,
				embeds: [
					new Embed({
						author: {
							name: "Bidome bot",
							icon_url: i.client.user!.avatarURL(),
						},
						title: "Unable to use calculator",
						description: "You are not the owner of this message.",
					}).setColor("red"),
				],
			});
		}
		return false;
	}
}
