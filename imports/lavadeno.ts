// @deno-types="npm:lavaclient@5.0.0-rc.3"
export * from "https://esm.sh/lavaclient@5.0.0-rc.3";

// Non exported types
/**
 * A base64 encoded track, due to lavalink being developed in java it cannot be decoded "normally".
 *
 * @see https://www.npmjs.com/package/@lavalink/encoding
 */
export type EncodedTrack = string;

export interface TrackInfo {
	identifier: string;
	isStream: boolean;
	isSeekable: boolean;
	author: string;
	length: number;
	position: number;
	title: string;
	uri: string;
	sourceName: string;
}

export interface Track {
	track: EncodedTrack;
	info: TrackInfo;
}
