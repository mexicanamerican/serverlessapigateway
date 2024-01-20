import apiConfig from './api-config.json';

// Export a default object containing event handlers
export default {
	// The fetch handler is invoked when this worker receives a HTTP(S) request
	// and should return a Response (optionally wrapped in a Promise)
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		// You'll find it helpful to parse the request.url string into a URL object. Learn more at https://developer.mozilla.org/en-US/docs/Web/API/URL
		const url = new URL(request.url);

		var matchedPath = apiConfig.paths.find((item) => item.path === url.pathname && item.method === request.method);
		console.log(matchedPath);
		if (matchedPath) {
			console.log(matchedPath);
			if (matchedPath.integration) {
				console.log('type:'+matchedPath.integration.type);
				if (matchedPath.integration.type === 'http_proxy') {
					const server = apiConfig.servers.find((server) => server.alias === matchedPath?.integration?.server);
					console.log(server);
					const modifiedRequest = new Request(server?.url + url.pathname, request);
					return fetch(modifiedRequest);
				}
			} else {
				return new Response(JSON.stringify(matchedPath.response));
			}
		}

		return new Response(
			`No match found.`,
			{ headers: { 'Content-Type': 'text/plain' } }
		);
	},
};
