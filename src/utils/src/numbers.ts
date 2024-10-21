/**
 * Returns a random integer between the specified values.
 */
export const getRandomInteger = (min: number, max: number): number => {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Inserts x numbers of filler before the number.
 */
export const padBeforeNumber = (
	num: number,
	maxLength: number,
	filler = "0",
): string => {
	return num.toString().padStart(maxLength, filler);
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

/**
 * Formats a number into a human readable format.
 */
export const formatNumber = (num: number): string => {
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
