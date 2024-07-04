import scss from "https://deno.land/x/denosass@1.0.6/mod.ts";
import { bundle } from "https://deno.land/x/emit@0.31.5/mod.ts";
import tailwindCss, { type Config } from "npm:tailwindcss@3.3.5";
import postcss from "npm:postcss@8.4.31";
import cssnano from "npm:cssnano@6.0.1";
import autoprefixer from "npm:autoprefixer@10.3.1";

tailwindCss();

const routes: Record<string, string> = {};

const segments = import.meta.url.substring(7).split("/").slice(0, -3);

const root = segments.join("/");

const recursiveWalk = async (path: string) => {
	for await (const file of Deno.readDir(path)) {
		const filePath = `${path}/${file.name}`;
		if (file.isDirectory) {
			await recursiveWalk(filePath);
		} else {
			let content = await Deno.readTextFile(filePath);

			if (
				["ts", "tsx", "jsx"].includes(
					filePath.substring(filePath.lastIndexOf(".") + 1),
				)
			) {
				const code = await bundle(filePath, {
					compilerOptions: {
						inlineSourceMap: false,
						inlineSources: false,
						jsx: "jsx",
						jsxFactory: "h",
						jsxFragmentFactory: "Fragment",
						sourceMap: false,
					},
				});

				content = code.code;
			}

			if (filePath.endsWith(".scss")) {
				const css = scss(filePath, {
					quiet: true,
				}).to_string();

				content = css as string;
			}

			routes[filePath.substring(root.length + "/routes/".length)] =
				content;
		}
	}
};

const path = `${root}/routes`;

await recursiveWalk(path);

// Tailwind
const tailwindConfig: Config = {
	content: [
		`${root}/routes/**/*.tsx`,
		`${root}/routes/**/*.ts`,
		`${root}/routes/**/*.jsx`,
		`${root}/routes/**/*.js`,
		`${root}/routes/**/*.html`,
		`${root}/routes/**/*.scss`,
		`${root}/routes/**/*.css`,
	],
};

const postCssPlugins: unknown = [
	tailwindCss(tailwindConfig) as postcss.Plugin,
	cssnano(),
	autoprefixer() as postcss.Plugin,
];

const post = postcss(postCssPlugins as postcss.Plugin[]);

for (const [key, value] of Object.entries(routes)) {
	if (!["scss", "css"].includes(key.substring(key.lastIndexOf(".") + 1))) {
		continue;
	}

	const res = await post.process(value, {
		from: undefined,
	});

	routes[key] = res.css;
}

// End Tailwind

try {
	await Deno.mkdir(`${root}/dist`, { recursive: true });
} catch (error) {
	console.error("Error while creating dist folder");
	console.error(error);
}

const filledRoutes: Record<string, string> = {};

for (const [key, value] of Object.entries(routes)) {
	const fileMatcher = (file: string) => {
		const strippedKey = file.substring(2, file.length - 2);

		if (strippedKey.startsWith("\\") || strippedKey.startsWith("$")) {
			return strippedKey;
		}

		if (Object.hasOwn(filledRoutes, strippedKey)) {
			const value = filledRoutes[strippedKey];

			switch (strippedKey.substring(strippedKey.lastIndexOf(".") + 1)) {
				case "scss":
				case "css": {
					return `<style>${value}</style>`;
				}

				case "js":
				case "jsx":
				case "ts":
				case "tsx": {
					return `<script type="module">${value}</script>`;
				}

				default: {
					return value;
				}
			}
		}

		return file;
	};

	filledRoutes[key] = value.replace(/{{.*}}/g, fileMatcher);
}

const assetsFile = [
	`// ! DO NOT EDIT !`,
	`// Use deno task desktop:rebuild to generate this file`,
	`// Built using Bidome Route Builder`,
	``,
	`const routes = ${JSON.stringify(filledRoutes, undefined, 4)};`,
	``,
	`export default routes;`,
].join("\n");

await Deno.writeTextFile(`${root}/dist/routes.ts`, assetsFile);

console.log(`Built ${Object.keys(filledRoutes).length} routes!`);
