export * from "jsr:@harmony/harmony@2.9.1";

import {
	ApplicationCommandInteraction,
	ApplicationCommandPartial,
} from "./harmony.ts";

export interface ApplicationCommand extends ApplicationCommandPartial {
	handler: (i: ApplicationCommandInteraction) => Promise<unknown> | unknown;
}

// For local harmony development:
// export * from "../../harmony/mod.ts";
