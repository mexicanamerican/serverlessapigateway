const { jwtAuth } = await import('./auth');
const responses = await import('./responses');
const { ValueMapper } = await import('./mapping');
const { setCorsHeaders } = await import('./cors');
const { PathOperator } = await import('./path-ops');
const _apiConfig = await import('./api-config.json')
const { AuthError } = await import('./types/error_types');
const { setPoweredByHeader } = await import('./powered-by');
const { createProxiedRequest } = await import('./requests');
const { IntegrationTypeEnum } = await import('./enums/integration-type');
const { auth0CallbackHandler, validateIdToken, getProfile, redirectToLogin } = await import('./integrations/auth0');


export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);

		const apiConfig = _apiConfig;

		// Handle CORS preflight (OPTIONS) requests directly
		if (apiConfig.cors && request.method === 'OPTIONS') {
			const matchedItem = apiConfig.paths.find((item) => {
				const matchResult = PathOperator.match(item.path, url.pathname, request.method, item.method);
				return item.method === 'OPTIONS' && matchResult.matchedCount > 0 && matchResult.methodMatches;
			});
			if (!matchedItem) {
				return setPoweredByHeader(setCorsHeaders(request, new Response(null, { status: 204 })));
			}
		}

		// Adjusted filtering based on the updated pathsMatch return value
		const matchedPaths = apiConfig.paths
			.map((config) => ({ config, matchResult: PathOperator.match(config.path, url.pathname, request.method, config.method) }))
			.filter((item) => item.matchResult.matchedCount > 0 && item.matchResult.methodMatches); // Only consider matches with the correct method

		// Sorting with priority: exact matches > parameterized matches > wildcard matches
		const matchedPath = matchedPaths.sort((a, b) => {
			// Prioritize exact matches
			if (a.matchResult.isExact !== b.matchResult.isExact) {
				return a.matchResult.isExact ? -1 : 1;
			}
			// Among exact or parameterized matches, prioritize those with more matched segments
			if (a.matchResult.matchedCount !== b.matchResult.matchedCount) {
				return b.matchResult.matchedCount - a.matchResult.matchedCount;
			}
			// If both are parameterized, prioritize non-wildcard over wildcard
			if (a.matchResult.isWildcard !== b.matchResult.isWildcard) {
				return a.matchResult.isWildcard ? 1 : -1;
			}
			// Prioritize exact method matches over "ANY"
			if (a.config.method !== b.config.method) {
				if (a.config.method === request.method) return -1;
				if (b.config.method === request.method) return 1;
			}
			return 0; // Equal priority
		})[0];

		if (matchedPath) {
			let jwtPayload = {};

			// Check if the matched path requires authorization
			if (apiConfig.authorizer && matchedPath.config.auth && apiConfig.authorizer.type == 'jwt') {
				try {
					jwtPayload = await jwtAuth(request);
				} catch (error) {
					if (error instanceof AuthError) {
						return setPoweredByHeader(
							setCorsHeaders(
								request,
								new Response(JSON.stringify({ error: error.message, code: error.code }), {
									status: error.statusCode,
									headers: { 'Content-Type': 'application/json' },
								}),
							),
						);
					} else {
						return setPoweredByHeader(setCorsHeaders(request, responses.internalServerErrorResponse()));
					}
				}
			}
			else if (apiConfig.authorizer && matchedPath.config.auth && apiConfig.authorizer.type == 'auth0') {
				try {
					await validateIdToken(request);
				} catch (error) {
					if (error instanceof AuthError) {
						return setPoweredByHeader(
							setCorsHeaders(
								request,
								new Response(JSON.stringify({ error: error.message, code: error.code }), {
									status: error.statusCode,
									headers: { 'Content-Type': 'application/json' },
								}),
							),
						);
					} else {
						return setPoweredByHeader(setCorsHeaders(request, responses.internalServerErrorResponse()));
					}
				}
			}

			if (matchedPath.config.integration && matchedPath.config.integration.type == IntegrationTypeEnum['HTTP_PROXY']) {
				const server =
					apiConfig.servers &&
					apiConfig.servers.find((server) => matchedPath.config.integration && server.alias === matchedPath.config.integration.server);
				if (server) {
					let modifiedRequest = createProxiedRequest(request, server, matchedPath.config);
					if (matchedPath.config.mapping) {
						modifiedRequest = await ValueMapper.modify({
							request: modifiedRequest,
							mappingConfig: matchedPath.config.mapping,
							jwtPayload,
							configVariables: matchedPath.config.variables,
							globalVariables: apiConfig.variables,
						});
					}
					return fetch(modifiedRequest).then((response) => setPoweredByHeader(setCorsHeaders(request, response)));
				}
			} else if (matchedPath.config.integration && matchedPath.config.integration.type == IntegrationTypeEnum['SERVICE']) {
				const service =
					apiConfig.services &&
					apiConfig.services.find((service) => matchedPath.config.integration && service.alias === matchedPath.config.integration.binding);

				if (service) {
					const module = await import(`${service.entrypoint}.js`);
					const Service = module.default;
					const serviceInstance = new Service();
					return serviceInstance.fetch(request, env, ctx);
				}
			}
			else if (matchedPath.config.integration && matchedPath.config.integration.type == IntegrationTypeEnum['AUTH0CALLBACK']) {
				const urlParams = new URLSearchParams(url.search);
				const code = urlParams.get('code');

				return auth0CallbackHandler(code);
			}
			else if (matchedPath.config.integration && matchedPath.config.integration.type == IntegrationTypeEnum['AUTH0USERINFO']) {
				const urlParams = new URLSearchParams(url.search);
				const accessToken = urlParams.get('access_token');

				return getProfile(accessToken);
			}
			else if (matchedPath.config.integration && matchedPath.config.integration.type == IntegrationTypeEnum['AUTH0CALLBACKREDIRECT']) {
				const urlParams = new URLSearchParams(url.search);
				return redirectToLogin({ state: urlParams.get('state') });
			}
			else {
				return setPoweredByHeader(
					setCorsHeaders(
						request,
						new Response(JSON.stringify(matchedPath.config.response), { headers: { 'Content-Type': 'application/json' } }),
					),
				);
			}
		}

		return setPoweredByHeader(setCorsHeaders(request, responses.noMatchResponse()));
	},
};
