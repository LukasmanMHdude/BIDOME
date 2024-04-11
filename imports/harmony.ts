export * from "https://raw.githubusercontent.com/harmonyland/harmony/b890958215c020d33866846510fc3e19f6295cec/mod.ts";
export * from "https://raw.githubusercontent.com/harmonyland/harmony/b890958215c020d33866846510fc3e19f6295cec/src/types/gatewayResponse.ts";

import {
	ApplicationCommandInteraction,
	ApplicationCommandPartial,
} from "./harmony.ts";

export interface ApplicationCommand extends ApplicationCommandPartial {
	handler: (i: ApplicationCommandInteraction) => Promise<void> | void;
}

// For local harmony development:
// export * from "../../harmony/mod.ts";
