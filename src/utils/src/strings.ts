/**
 * Shortens a string to the maximum length and adds an ellipsis after if it's longer
 */
export const truncateString = (str: string, maxLength: number) => {
	return str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;
};

/**
 * Shortens a string to the maximum length and adds an ellipsis beforehand if it's longer
 */
export const reverseTruncateString = (str: string, length: number) => {
	return str.length <= length ? str : `...${str.slice(str.length - length)}`;
};

/**
 * Capitalizes the first word of a string
 */
export const capitalizeFirstWord = (str: string) => {
	return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Capitalizes all words in a string
 */
export const capitalizeAllWords = (str: string) => {
	return str.split(" ").map(capitalizeFirstWord).join(" ");
};
