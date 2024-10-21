/**
 * Parses an env file into a Record<string, string> of all the entries
 */
export const parseEnv = (env: string): Record<string, string> => {
	const lines = env.match(
		/[a-zA-Z_][a-zA-Z0-9_]*=([^\n ]*)|('[^\n]*')|("[^\n]*")|(`.*`)/g,
	) ?? [];

	const result: Record<string, string> = {};

	for (const line of lines) {
		const [key, value] = line.split("=").map((part) => part.trim()).map((
			part,
		) => /^(["'`]).*(["'`])$/.test(part) ? part.slice(1, -1) : part);
		result[key] = value;
	}

	return result;
};

/**
 * Sets env variables
 */
export const setEnv = (env: Record<string, string>): void => {
	for (const key in env) {
		Deno.env.set(key, env[key]);
	}
};

/**
 * Deletes env variables
 */
export const removeEnv = (...env: string[]): void => {
	for (const key of env) {
		Deno.env.delete(key);
	}
};

/**
 * Loads an env file and sets the env variables
 */
export const loadEnv = (envPath = ".env"): void => {
	const env = Deno.readTextFileSync(envPath);
	const parsedEnv = parseEnv(env);
	setEnv(parsedEnv);
};
