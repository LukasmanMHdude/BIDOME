import "./imports/env.ts";
import { Embed, Webhook } from "./imports/harmony.ts";
import { formatMs, reverseTruncateString, sleep } from "./imports/tools.ts";

try {
	await Deno.remove("logs", {
		recursive: true,
	});
} catch {
	// Ignore
}

await Deno.mkdir("logs");

let currentLogFile = `${Date.now()}.log`;
let logContent = "";

const textDecoder = new TextDecoder();

const logFunction = console.log;

const convertStr = (str: unknown) => {
	if (str instanceof Error) {
		return `${str.name}: ${str.message}\n${str.stack}\n${str.cause ?? ""}`;
	}
	if (typeof str == "object") {
		return JSON.stringify(str);
	}
	return `${str}`;
};

const getLogPrefix = () => {
	const date = new Date();
	const amOrPm = date.getHours() > 12 ? "PM" : "AM";
	const hours = amOrPm == "AM" ? date.getHours() : date.getHours() - 12;
	return `[${date.getMonth()}/${date.getDate()}/${date.getFullYear()} ${hours}:${
		date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()
	}${amOrPm}]`;
};

console.log = (...args) => {
	logContent += `${getLogPrefix()} ${args.map(convertStr).join(" ")}\n`;
	logFunction(getLogPrefix(), ...args);
};

const startNewInstance = async () => {
	logContent = "";
	currentLogFile = `${Date.now()}.log`;

	for (
		const command of [
			"fetch",
			`reset --hard origin/${Deno.env.get("GH_BRANCH")}`,
		]
	) {
		if (
			Deno.env.get("IS_LOCAL") == "true" ||
			Deno.env.get("DISABLE_UPDATER") == "true"
		) {
			break;
		}
		const git = new Deno.Command("git", {
			args: command.split(" "),
			stdout: "piped",
			stderr: "piped",
		});
		const out = await git.output();
		console.log(
			textDecoder.decode(out.stdout) + textDecoder.decode(out.stderr),
		);
	}

	const instance = new Worker(
		new URL(`./index.ts#${Date.now()}`, import.meta.url),
		{
			type: "module",
		},
	);

	instance.addEventListener("message", (e) => {
		if (e.data.type != "log") return;
		const logPrefix = e.data.prefix;
		const logData = e.data.data;
		//console.log(logPrefix, ...logData);
		logContent += `${logPrefix} ${logData.map(convertStr).join(" ")}\n`;
	});

	return new Promise<number>((resolve, _reject) => {
		instance.addEventListener("error", async (e) => {
			instance.terminate();
			console.log("Instance errored");
			console.log("Error info:");
			console.log(e);
			console.log(`${e.message} ${e.filename}:${e.lineno}:${e.colno}`);
			await Deno.writeTextFile(`./logs/${currentLogFile}`, logContent);
			await sleep(1000);
			resolve(1);
		});

		instance.addEventListener("error", (e) => {
			// For some reason this doesn't work in async
			e.preventDefault();
		});

		instance.addEventListener("message", (e) => {
			if (e.data.type == "exit") {
				instance.terminate();
				resolve(0);
			}
		});
	});
};

const webhook = Deno.env.get("WEBHOOK_URL") != undefined
	? await Webhook.fromURL(Deno.env.get("WEBHOOK_URL")!)
	: undefined;
let tooFastCrashes = 0;

while (true) {
	console.log("Creating instance");
	const created = Date.now();
	const res = await startNewInstance();
	console.log(res == 0 ? "Instance restarting" : "Instance errored");
	const crashed = Date.now();
	const aliveFor = crashed - created;

	console.log("Instance crashed");
	console.log(`Instance ran for ${formatMs(aliveFor)}`);

	if (webhook != undefined) {
		webhook.send({
			embeds: [
				new Embed({
					author: {
						name: Deno.env.get("WEBHOOK_NAME") ??
							"Bidome Crash Handler",
						icon_url:
							"https://cdn.discordapp.com/avatars/778670182956531773/75fdc201ce942f628a61f9022db406dc.png?size=1024",
					},
					title: `Bidome has crashed!`,
					description: `Rebooting the bot, time bot was alive: ${
						formatMs(
							aliveFor,
							true,
						)
					}`,
					fields: [
						{
							name: "Crash Log",
							value: `\`\`\`ansi\n${
								reverseTruncateString(
									logContent,
									1000,
								)
							}\n\`\`\``,
						},
					],
				}).setColor("random"),
			],
		});
	}

	await sleep(1000);

	if (tooFastCrashes >= 5) {
		console.log(
			"Instance crashed to often! Restarting container in 5 minutes",
		);
		await sleep(1000 * 60 * 5);
		Deno.exit(1);
	}

	if (tooFastCrashes >= 3) {
		console.log(
			"Instance crashed too fast multiple times in a row! Waiting 10 minutes before restarting",
		);
		await sleep(1000 * 60 * 10);
	}

	if (aliveFor < 1000 * 10) {
		console.log(
			"Instance crashed too fast! Waiting 10 seconds before restarting",
		);
		tooFastCrashes++;
		await sleep(1000 * 10);
	} else {
		tooFastCrashes = 0;
	}
}
