/**
 * Finds all files in said directory and any subdirectories
 */
export const getAllFilesRecursively = async (
	dir: string,
	extensions?: string[],
): Promise<string[]> => {
	const files: string[] = [];
	extensions = extensions?.map((ext) => ext.toLowerCase());

	for await (const file of Deno.readDir(dir)) {
		const filePath = `${dir}/${file.name}`;

		if (file.isDirectory) {
			const subFiles = await getAllFilesRecursively(filePath, extensions);
			files.push(...subFiles);
		} else {
			if (extensions != undefined) {
				const ext = filePath.split(".").pop() ?? "";
				if (!extensions.includes(ext)) {
					continue;
				}
			}
			files.push(filePath);
		}
	}

	return files;
};

/**
 * Finds all folders in said directory
 */
export const getAllRootFolders = async (dir: string): Promise<string[]> => {
	const folders: string[] = [];

	for await (const file of Deno.readDir(dir)) {
		if (file.isDirectory) {
			folders.push(`${dir}/${file.name}`);
		}
	}

	return folders;
};
