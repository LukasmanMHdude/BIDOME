import { Command, type CommandOptions } from "./command.ts";
import type { CommandContext } from "./commandcontext.ts";

export interface SubcommandOptions extends CommandOptions {
	/** If all of the options in the base command should be applied to the subcommand */
	inherit?: boolean;
}

export const subcommand = (
	options: SubcommandOptions,
): (
	originalFunction: (context: CommandContext) => void,
	classInfo: ClassMethodDecoratorContext<Command>,
) => (context: CommandContext) => void => {
	return (originalFunction: (context: CommandContext) => void, {
		name,
		addInitializer,
		private: _private,
	}: ClassMethodDecoratorContext<Command>) => {
		if (_private) {
			throw new Error("Subcommand cannot be private");
		}

		addInitializer(function () {
			const command = new Command();

			if (options.inherit) {
				delete options.inherit;

				interface CommandOptionsWithSubcommands extends CommandOptions {
					subCommands?: Command[];
				}

				const optionsToReplaceWith: CommandOptionsWithSubcommands = {
					...this,
					usage: undefined,
					examples: undefined,
					subCommands: [],
					execute: () => {},
				};

				Object.assign(command, optionsToReplaceWith);
			}

			Object.assign(command, options);

			command.name = name.toString();
			command.execute = originalFunction.bind(this);

			if (options !== undefined) Object.assign(command, options);
			if (this.subCommands === undefined) this.subCommands = [];
			this.subCommands.push(command);
		});

		return originalFunction;
	};
};
