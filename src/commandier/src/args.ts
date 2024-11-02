export type ArgType =
	| "string"
	| "number"
	| "boolean"
	| "user"
	| "role"
	| "channel"
	| "options";

export type Arg = {
	type: ArgType;
	required: boolean;
	/** Only allowed if type is options */
	choices?: string[];
};

export class ArgsBuilder {
	/** The order arguments are parsed in message commands */
	public argsOrder: string[] = [];

	public args: Record<string, Arg> = {};

	public addArg(
		name: string,
		type: ArgType,
		required = true,
		choices?: string[],
	): ArgsBuilder {
		this.argsOrder.push(name);
		this.args[name] = { type, required, choices };

		return this;
	}

	public setOrder(...args: (string | string[])[]): ArgsBuilder {
		this.argsOrder = args.flat();
		return this;
	}
}
