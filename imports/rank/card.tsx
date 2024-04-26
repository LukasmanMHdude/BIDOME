/** @jsxImportSource jsr:@mary/jsx */
import type { JSXNode } from "jsr:@mary/jsx";
import { setup, tw } from "npm:twind";
import { getStyleTag, virtualSheet } from "npm:twind/sheets";
import * as colors from "npm:twind/colors";

const sheet = virtualSheet();

setup({
	theme: {
		fontFamily: {
			sans: ["Helvetica", "sans-serif"],
			serif: ["Times", "serif"],
		},
		extend: {
			colors: {
				...colors,
				// For some reason twind doesn't have these colors
				neutral: {
					"800": "#262626",
					"900": "#171717",
				},
				yellow: {
					"400/20": "rgb(250 204 21 / 0.2)",
				},
				blue: {
					"500/20": "rgb(59 130 246 / 0.2)",
				},
			},
		},
	},
	sheet,
});

export enum StatusColors {
	online = "#43B581",
	idle = "#FAA61A",
	dnd = "#F04747",
	offline = "#747F8D",
	streaming = "#593695",
}

interface ComponentProps {
	username: string;
	tag: string;
	status: StatusColors;
	avatar: string;
	level: number;
	rank: number;
	xp: number;
	neededXp: number;
}

const Component = ({
	avatar,
	level,
	neededXp,
	rank,
	status,
	tag,
	username,
	xp,
}: ComponentProps) => {
	const width = (xp / neededXp) * 100;

	const colors: {
		from: number;
		to?: number;
		background: string;
		text: string;
		levelBackground: string;
		levelText: string;
	}[] = [
		{
			from: 0,
			to: 1,
			background: "bg-yellow-400/20",
			text: "text-yellow-500",
			levelBackground: "bg-blue-500/20",
			levelText: "text-blue-500",
		},
		{
			from: 1,
			to: 2,
			background: "bg-yellow-400/20",
			text: "text-yellow-500",
			levelBackground: "bg-blue-500/20",
			levelText: "text-blue-500",
		},
		{
			from: 2,
			to: 3,
			background: "bg-yellow-400/20",
			text: "text-yellow-500",
			levelBackground: "bg-blue-500/20",
			levelText: "text-blue-500",
		},
		{
			from: 3,
			to: 10,
			background: "bg-yellow-400/20",
			text: "text-yellow-500",
			levelBackground: "bg-blue-500/20",
			levelText: "text-blue-500",
		},
		{
			from: 10,
			to: 50,
			background: "bg-yellow-400/20",
			text: "text-yellow-500",
			levelBackground: "bg-blue-500/20",
			levelText: "text-blue-500",
		},
		{
			from: 50,
			to: 100,
			background: "bg-yellow-400/20",
			text: "text-yellow-500",
			levelBackground: "bg-blue-500/20",
			levelText: "text-blue-500",
		},
		{
			from: 100,
			background: "bg-yellow-400/20",
			text: "text-yellow-500",
			levelBackground: "bg-blue-500/20",
			levelText: "text-blue-500",
		},
	];

	const getRankColor = (rank: number) => {
		for (const color of colors) {
			if (
				color.from <= rank &&
				(color.to == undefined || color.to >= rank)
			) {
				return color;
			}
		}
		return colors[colors.length - 1];
	};

	const color = getRankColor(rank);

	return (
		<>
			<div
				class={tw`flex h-[150px] w-[500px] rounded-2xl bg-neutral-900 p-6 font-medium text-white`}
			>
				<div class={tw`relative my-auto`}>
					<img src={avatar} class={tw`w-24 rounded-full`} />
					<div
						class={tw`absolute bottom-0 right-0 h-6 w-6 rounded-full border-2 border-neutral-900 bg-[${status.toString()}]`}
					>
					</div>
				</div>
				<div class={tw`mb-2 ml-6 mt-1 flex flex-grow flex-col`}>
					<div
						class={tw`ml-auto rounded ${color.background} px-1.5 py-0.5 text-sm font-medium ${color.text}`}
					>
						Ranked #{rank}
					</div>
					<h1 class={tw``}>
						<span class={tw`text-lg`}>{username}</span>
						<span
							class={tw`ml-1 text-sm font-normal text-gray-400`}
						>
							#{tag}
						</span>
					</h1>
					<h2 class={tw`mt-0.5 text-xs`}>
						{xp}
						<span class={tw`text-gray-400`}>/ {neededXp}xp</span>
					</h2>
					<div class={tw`flex flex-grow`}>
						<div
							class={tw`relative flex h-6 flex-grow overflow-hidden rounded bg-neutral-800`}
						>
							<div class={tw`absolute inset-0`}>
								<div
									class={tw`h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded`}
									style={`width: ${width}%`}
								>
								</div>
							</div>
							<div
								class={tw`h-full bg-gradient-to-r from-blue-500 to-blue-600`}
								style={`width: ${width}%`}
							>
							</div>
							<div class={tw`h-6 w-6 text-blue-600`}>
								<svg
									height={24}
									viewBox={`0 0 61 45`}
									fill={`currentColor`}
									xmlns={`http://www.w3.org/2000/svg`}
									class={tw`-translate-x-1`}
								>
									<path
										d={`M14.5 23.5C14.0662 16.7895 22.6533 14.6927 22 8C21.6758 4.67914 19 0 19 0H0.5V45H15.5C17.3333 42.8333 20.5253 40.0916 21 36C21.6341 30.5346 14.855 28.9906 14.5 23.5Z`}
										fill={`currentColor`}
									/>
									<circle
										cx={`50.5`}
										cy={`20.5`}
										r={`1.5`}
										fill={`currentColor`}
									/>
									<circle
										cx={`60`}
										cy={`14`}
										r={`1`}
										fill={`currentColor`}
									/>
									<circle
										cx={`55`}
										cy={`35`}
										r={`1`}
										fill={`currentColor`}
									/>
									<circle
										cx={`37`}
										cy={`16`}
										r={`2`}
										fill={`currentColor`}
									/>
									<circle
										cx={`28.5`}
										cy={`4.5`}
										r={`2.5`}
										fill={`currentColor`}
									/>
									<circle
										cx={`28.5`}
										cy={`22.5`}
										r={`2.5`}
										fill={`currentColor`}
									/>
									<circle
										cx={`27.5`}
										cy={`37.5`}
										r={`2.5`}
										fill={`currentColor`}
									/>
									<circle
										cx={`39.5`}
										cy={`30.5`}
										r={`1.5`}
										fill={`currentColor`}
									/>
									<circle
										cx={`45.5`}
										cy={`6.5`}
										r={`1.5`}
										fill={`currentColor`}
									/>
								</svg>
							</div>
						</div>
						<div
							class={tw`ml-2 rounded ${color.levelBackground} px-2 ${color.levelText}`}
						>
							{level}
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default async function Card(props: ComponentProps) {
	sheet.reset();
	const body = Component(props);
	const styleTag = getStyleTag(sheet);
	return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <title>Hello from Deno</title>
        ${styleTag}
      </head>
      <body>
        ${body}
      </body>
    </html>`;
}
