import { Webview } from "../deps/desktop/webview.ts";
import { renderRoute } from "./utils/prebuild/routes.ts";
import { getConfig } from "./utils/config.ts";

const config = await getConfig();

if (config instanceof Error) {
	const webview = new Webview();
	renderRoute(webview, "error.html", config.message, config.cause as string);
	webview.run();
	Deno.exit(1);
}

if (!config.rememberSettings) {
	const webview = new Webview();
	renderRoute(webview, "prelaunch.html");
	webview.run();
	console.log("Webview closed");
}
