/**
 * Shuffles and returns the array
 */
export const shuffleArray = <T>(array: T[]): T[] => {
	let elements = array;

	for (let i = 0; i < elements.length; i++) {
		const shuffledArray: T[] = [];

		for (const element of elements) {
			const before = "abcdef12".includes(crypto.randomUUID().slice(0, 1))
				? true
				: false;
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
