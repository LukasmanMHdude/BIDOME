export class Command {
	public name: string;
	public aliases: string[] = [];
	public description: string | undefined = undefined;
	public usage: string[] | undefined = undefined;
	// TODO: Figure out what the types are going to be for this
	public args: { optional?: boolean }[] = [];
	public permissions: unknown = {};
	public executor: () => void = () => {};

	constructor(name: string) {
		this.name = name;
	}

	public setAliases(aliases: string[]) {
		this.aliases = aliases;
	}

	public setUsage(usage: string[]) {
		this.usage = usage;
	}

	public setDescription(description: string) {
		this.description = description;
	}

	public setPermissions(permissions: unknown) {
		this.permissions = permissions;
	}

	public addArgument(arg: { optional?: boolean}) {
		this.args.push(arg);
	}

	public setExecutor(func: () => void) {
		this.executor = func;
	}
}
