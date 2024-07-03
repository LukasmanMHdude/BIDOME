export const formatMs = (ms: number, long = false): string => {
	let seconds = Math.floor(ms / 1000);
	const showMs = seconds < 1;
	let minutes = Math.floor(seconds / 60);
	seconds -= minutes * 60;
	let hours = Math.floor(minutes / 60);
	minutes -= hours * 60;
	let days = Math.floor(hours / 24);
	hours -= days * 24;
	const weeks = Math.floor(days / 7);
	days -= weeks * 7;
	if (long) {
		return [
			`${weeks > 0 ? ` ${weeks} Week${weeks > 1 ? "s" : ""}` : ""}`,
			`${days > 0 ? ` ${days} Day${days > 1 ? "s" : ""}` : ""}`,
			`${hours > 0 ? ` ${hours} Hour${hours > 1 ? "s" : ""}` : ""}`,
			`${
				minutes > 0
					? ` ${minutes} Minute${minutes > 1 ? "s" : ""}`
					: ""
			}`,
			`${
				seconds > 0
					? ` ${seconds} Second${seconds > 1 ? "s" : ""}`
					: ""
			}`,
			`${showMs ? ` ${ms} Milisecond${ms > 1 ? "s" : ""}` : ""}`,
		]
			.join("")
			.substring(1);
	} else {
		return [
			`${weeks > 0 ? `${weeks}:` : ""}`,
			`${weeks > 0 || days > 0 ? `${days}:` : ""}`,
			`${hours > 0 ? `${hours < 10 ? `0${hours}` : hours}:` : ""}`,
			`${minutes < 10 ? `0${minutes}` : minutes}:`,
			`${seconds < 10 ? `0${seconds}` : seconds}`,
			`${showMs ? `:${(ms < 10 ? `0${seconds}` : seconds)}` : ""}`,
		].join("");
	}
};

export const isOneGreaterThan0 = (...args: number[]): boolean => {
	for (const arg of args) {
		if (arg ?? 0 > 0) {
			return true;
		}
	}
	return false;
};

export const areAllGreaterThan0 = (...args: number[]): boolean => {
	let validNums = 0;
	for (const arg of args) {
		if (arg ?? 0 > 0) {
			validNums++;
		}
	}
	return validNums == args.length;
};

export const format = (name: string): string => {
	return `${name.substring(0, 1).toUpperCase()}${
		name
			.substring(1)
			.toLowerCase()
	}`;
};

export const removeDiscordCodeBlocks = (text: string): string => {
	return text.replace(/`/gi, "\\`");
};

export const getRandomInteger = (min: number, max: number): number => {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const shuffleArray = <T>(array: T[]) => {
	let elements = array;

	for (let i = 0; i < elements.length; i++) {
		const shuffledArray: T[] = [];

		for (const element of elements) {
			const before = Math.random() < 0.5 ? true : false;
			if (before) {
				shuffledArray.unshift(element);
			} else {
				shuffledArray.push(element);
			}
		}

		elements = shuffledArray;
	}

	return elements;
};

export enum TimeUnit {
	MILISECOND = 1,
	SECOND = 1000,
	MINUTE = 60 * 1000,
	HOUR = 60 * 60 * 1000,
	DAY = 24 * 60 * 60 * 1000,
	WEEK = 7 * 24 * 60 * 60 * 1000,
	MONTH = 30 * 24 * 60 * 60 * 1000,
	YEAR = 365 * 24 * 60 * 60 * 1000,
}

export const toMs = (str: string) => {
	let msValue = NaN;
	let unitType = "";
	let unitValue = "";

	const convertToMS = () => {
		const value = parseInt(unitValue) *
			({
				// Shortened
				ms: TimeUnit.MILISECOND,
				s: TimeUnit.SECOND,
				m: TimeUnit.MINUTE,
				h: TimeUnit.HOUR,
				d: TimeUnit.DAY,
				w: TimeUnit.WEEK,
				mo: TimeUnit.MONTH,
				y: TimeUnit.YEAR,

				// Full
				millisecond: TimeUnit.MILISECOND,
				second: TimeUnit.SECOND,
				minute: TimeUnit.MINUTE,
				hour: TimeUnit.HOUR,
				day: TimeUnit.DAY,
				week: TimeUnit.WEEK,
				month: TimeUnit.MONTH,
				year: TimeUnit.YEAR,

				// Full plural
				milliseconds: TimeUnit.MILISECOND,
				seconds: TimeUnit.SECOND,
				minutes: TimeUnit.MINUTE,
				hours: TimeUnit.HOUR,
				days: TimeUnit.DAY,
				weeks: TimeUnit.WEEK,
				months: TimeUnit.MONTH,
				years: TimeUnit.YEAR,
			}[unitType] as number);
		if (value != 0) {
			if (isNaN(msValue)) {
				msValue = 0;
			}
			msValue += value;
		}
		unitType = "";
		unitValue = "";
	};

	for (const char of str.toLowerCase()) {
		if (char == " ") continue;
		if (!isNaN(parseInt(char)) || char == "-") {
			if (unitType !== "") {
				convertToMS();
			}
			if (unitType === "") {
				unitValue += char;
			}
		} else {
			unitType += char;
		}
	}

	if (unitType !== "") {
		convertToMS();
	}

	if (isNaN(msValue)) {
		return NaN;
	}

	return msValue;
};

export const sleep = (length: number) =>
	new Promise((resolve) => setTimeout(resolve, length));

export const loopFilesAndReturn = async (
	path: string,
	extensions: string[] = [".ts", ".tsx", ".js", ".jsx"],
) => {
	const files: string[] = [];

	try {
		await Deno.mkdir(path, { recursive: true });
	} catch {
		// Ignore
	}

	for await (const file of Deno.readDir(path)) {
		if (file.name.trim().startsWith("-")) continue;
		const uri = `${path}${path.endsWith("/") ? "" : "/"}${file.name}`;
		if (file.isFile) {
			for (const ext of extensions) {
				if (file.name.startsWith("-")) continue;
				if (file.name.trim().toLowerCase().endsWith(ext)) {
					files.push(uri);
				}
			}
		} else {
			if (file.isDirectory) {
				files.push(...(await loopFilesAndReturn(uri)));
			}
		}
	}

	return files.map((file) => `${file}#${Date.now()}`);
};

export enum NumberUnit {
	THOUSAND = 1000,
	MILLION = 1000000,
	BILLION = 1000000000,
	TRILLION = 1000000000000,
	QUADRILLION = 1000000000000000,
	// Might not fit in an integer
	// QUINTILLION = 1000000000000000000,
	// SEXTILLION = 1000000000000000000000,
	// SEPTILLION = 1000000000000000000000000,
	// OCTILLION = 1000000000000000000000000000,
	// NONILLION = 1000000000000000000000000000000,
	// DECILLION = 1000000000000000000000000000000000,
}

export const formatNumber = (num: number) => {
	const prefix = {
		[NumberUnit.QUADRILLION]: "Q",
		[NumberUnit.TRILLION]: "T",
		[NumberUnit.BILLION]: "B",
		[NumberUnit.MILLION]: "M",
		[NumberUnit.THOUSAND]: "K",
	};

	for (const [key, value] of Object.entries(prefix)) {
		if (num >= parseInt(key)) {
			const numberValue = (num / parseInt(key)).toFixed(1);
			if (numberValue.endsWith(".0")) {
				return `${numberValue.slice(0, -2)}${value}`;
			}
			return `${numberValue}${value}`;
		}
	}

	return num.toString();
};

export const truncateString = (str: string, length: number) => {
	if (str.length <= length) return str;
	return `${str.slice(0, length)}...`;
};

export const reverseTruncateString = (str: string, length: number) => {
	if (str.length <= length) return str;
	return `...${str.slice(str.length - length)}`;
};
