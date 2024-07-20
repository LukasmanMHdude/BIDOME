import { ClusterNodeOptions } from "./lavadeno.ts";

const nodesCount = parseInt(Deno.env.get("LAVALINK_NODES")!);

if (isNaN(nodesCount)) {
	throw new Error("Invalid node count");
}

export const nodes: ClusterNodeOptions[] = new Array(nodesCount)
	.fill(undefined)
	.map((_, i) => ({
		info: {
			host: Deno.env.get(`LAVALINK_${i + 1}_HOST`)!,
			port: parseInt(Deno.env.get(`LAVALINK_${i + 1}_PORT`)!),
			auth: Deno.env.get(`LAVALINK_${i + 1}_PASSWORD`)!,
			secure: Deno.env.get(`LAVALINK_${i + 1}_SECURE`) == "true",
		},
		identifier: Deno.env.get(`LAVALINK_${i + 1}_NAME`)!,
		ws: {
			reconnecting: {
				tries: Infinity,
				delay: 5 * 1000,
			},
			clientName: "Bidome",
		},
	}));
