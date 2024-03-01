<div align="center">
	<img  src="docs/img/hero.jpeg">
    <h1> 
        <strong>Serverless API Gateway</strong>
    </h1>
</div>

[![JWT COMPATIBLE](https://jwt.io/img/badge-compatible.svg)]()

Welcome to the Serverless API Gateway, an innovative tool designed to streamline your API management tasks using the powerful capabilities of Cloudflare Workers.

## Features

- **JS Workers**: Write serverless JavaScript workers that intercept and modify your API requests and responses on the fly.
- **Routing (Path and Method)**: Simplify your API architecture with flexible path and method-based routing for directing traffic to the appropriate endpoints.
- **CORS (Basic)**: Manage cross-origin resource sharing settings with ease, ensuring your APIs can securely handle requests from different origins.
- **Auth (JWT)**: Secure your APIs by implementing JSON Web Token (JWT) based authentication to validate and manage user access efficiently.
- **Value Mapping**: Map values from sources to destinations, allowing you to easily transform your data.

## Motivation

APIs are pivotal in the landscape of modern applications, but they bring forth a unique set of challenges regarding security, routing, and overall management. The Serverless API Gateway emerged from the need to address these issues in a reliable, manageable, and cost-effective way. Built upon Cloudflare's serverless infrastructure, this project provides developers with a lightweight yet robust toolkit that adapts to the unpredictability of internet scale and traffic. Our mission is to empower developers to securely and efficiently manage their APIs without the overhead of managing infrastructure.

## Getting Started

To start using the Serverless API Gateway:

1. Clone the repository:
```bash
git clone https://github.com/irensaltali/serverlessapigateway.git
```

1. Install dependencies:
```bash
cd worker
npm install
```

1. Configure your routes, CORS settings, and JWT secrets within the provided configuration files.

2. Deploy your workers to Cloudflare using the command:
```bash
wrangler publish
```

(For detailed setup and usage instructions, please see the Cloudflare Workers' [documentation](https://developers.cloudflare.com/workers)).

## JSON Configuration Guide

This document provides detailed guidance on how to use the provided JSON configuration for setting up and managing your application's server, CORS (Cross-Origin Resource Sharing) settings, authorization, and API paths.

### Configuration Overview

The JSON configuration is divided into several key sections:

- `servers`: Defines server aliases and URLs.
- `cors`: Configures Cross-Origin Resource Sharing settings.
- `authorizer`: Sets up authorization parameters.
- `paths`: Specifies API endpoints and their behaviors.


### Servers

The `servers` section is an array of objects where each object represents a server configuration.

- `alias`: A shorthand name for the server.
- `url`: The full URL to access the server.

#### Example

```json
"servers": [
    {
        "alias": "ngrok",
        "url": "https://a8ee-176-88-98-23.ngrok-free.app"
    }
]
```
### CORS

The CORS section defines the CORS policy for your application.

- `allow_origins`: Specifies which origins are allowed.
- `allow_methods`: Lists the HTTP methods allowed.
- `allow_headers`: Headers that are allowed in requests.
- `expose_headers`: Headers that are exposed in responses.
- `allow_credentials`: Indicates whether credentials are supported.
- `max_age`: Specifies the cache duration for preflight requests.

#### Example

```json
"cors": {
    "allow_origins": [
        "https://example.com",
        "https://example2.com"
    ],
    "allow_methods": [
        "GET",
        "POST",
        "PUT",
        "DELETE"
    ],
    "allow_headers": [
        "Content-Type",
        "Authorization"
    ],
    "expose_headers": [
        "Content-Type",
        "Authorization"
    ],
    "allow_credentials": true,
    "max_age": 86400
}
```

### Authorizer

The authorizer section configures the authorization mechanism. ServerlessAPIGateway currently supports JWT (JSON Web Token) based authorization with HS256 algorithm.

- `type`: Type of authorization (e.g., JWT).
- `secret`: Secret key for authorization.
- `algorithm`: Algorithm used for token validation.
- `audience`: Intended audience of the token.
- `issuer`: The issuer of the token.

#### Example

```json
{
    "authorizer": {
        "type": "jwt",
        "secret": "{YOUR_SECRET_KEY}",
        "algorithm": "HS256",
        "audience": "opensourcecommunity",
        "issuer": "serverlessapigw"
    },
}
```


### Paths

The paths section is an array of objects where each object represents an API endpoint configuration.

- `method`: HTTP method (GET, POST, etc.).
- `path`: URL path of the API endpoint.
- `integration`: Server integration settings.
- `auth`: Indicates if the path requires authentication.
- `mapping`: Defines mappings for headers and query parameters.
- `variables`: Sets variables used in the endpoint.
- `response`: Specifies the response structure for the endpoint.

## Deployment

You can deploy the Serverless API Gateway to Cloudflare Workers using the provided `wrangler.toml` configuration file. After setting up your configuration, you can deploy your workers using the following command:

```bash
wrangler publish
```

If you like to use GitHub actions for deployment here is is way for that. Add 'api-config.json' and 'wrangler.toml' file to your repository and add the following secrets to your repository.

```
── .githib
│   ├── workflows
│   │   ├── deploy-serverless-api-gateway.yml
├── api-config.json
└── wrangler.toml
```

deploy-serverless-api-gateway.yml
```yaml
name: Deploy Serverless API Gateway

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Prepare Serverless API Gateway Config for Deployment
      uses: irensaltali/serverlessapigateway-action@v0.0.4
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      with:
        configJson: './api-config.json'
        wranglerToml: './wrangler.toml'
        versionTag: 'v1.0.1'
    - name: Deploy to Cloudflare Workers
      uses: cloudflare/wrangler-action@v3
      with:
        apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
        workingDirectory: "worker"
```


## Usage Guidelines

- Ensure that each section of the JSON is correctly formatted according to the [schema](./worker/src/api-config.schema.json).
- Modify the configuration to suit your application's requirements.
- The configuration should be loaded and parsed by your application at startup.


## Contributing

Your contributions are what make the Serverless API Gateway an even better API management solution! If you have suggestions for new features, notice a bug, or want to improve the code, please take the following steps:

1. Fork the repository.
2. Implement your changes on a new branch.
3. Submit a pull request with a clear description of your improvements.


## Acknowledgments

A shoutout to the contributors, community members, and the maintainers of Cloudflare Workers for their support and inspiration in making this project a reality.

The Serverless API Gateway is not just another API tool; it's created by developers, for developers, with the vision of making API management a breeze. Let's build together.


## Support

I'm always happy to help with any questions or concerns you may have. Feel free to reach out to me from on [Twitter](https://twitter.com/irensaltali) or [LinkedIn](https://www.linkedin.com/in/irensaltali/).

If you need a more extensive support you can always book on [Superpeer](https://superpeer.com/irensaltali/-/serverless-api-gateway)

# Companies that use Serverless API Gateway

<div align="center">
	<a href="https://wope.com"> <img width="200" src="docs/img/wope.png"> </a>
</div>

Let us know if you are using Serverless API Gateway and we can add your company here.
