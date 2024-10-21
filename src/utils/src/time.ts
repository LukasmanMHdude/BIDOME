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

const unitsToNames = {
	[TimeUnit.MILISECOND]: ["ms", "milisecond", "miliseconds"],
	[TimeUnit.SECOND]: ["s", "second", "seconds"],
	[TimeUnit.MINUTE]: ["m", "minute", "minutes"],
	[TimeUnit.HOUR]: ["h", "hour", "hours"],
	[TimeUnit.DAY]: ["d", "day", "days"],
	[TimeUnit.WEEK]: ["w", "week", "weeks"],
	[TimeUnit.MONTH]: ["mo", "month", "months"],
	[TimeUnit.YEAR]: ["y", "year", "years"],
};

const namesToUnits: Record<string, number> = {};

for (const [unit, names] of Object.entries(unitsToNames)) {
	for (const name of names) {
		namesToUnits[name] = parseInt(unit);
	}
}

/**
 * Converts a time from a human readable string to a number
 * @example "1h 30m" -> 5400000
 */
export const stringToMS = (time: string): number => {
	const match = time.match(/([0-9]{1,}|[0-9.][0-9]{1,}) ?(\w+)/gi);
	let duration = 0;

	if (!match) {
		throw new Error("Invalid time string");
	}

	for (const unit of match) {
		const [amount, type] = unit.includes(" ")
			? unit.split(" ")
			: [unit.replace(/[^0-9\.]/g, ""), unit.replace(/[0-9\.]/g, "")];
		const unitValue = namesToUnits[type];
		const amountParsed = parseFloat(amount);

		if (isNaN(amountParsed)) {
			throw new Error(`Invalid time amount: ${amount}`);
		}

		if (!unitValue) {
			throw new Error(`Invalid time unit: ${type}`);
		}

		duration += amountParsed * unitValue;
	}

	return duration;
};
