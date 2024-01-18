# Development

KnowBe4 is a security-awareness training provider.

## Prerequisites

The integration uses `fetch` for communicating with the REST API.

## Provider account setup

The provider does not provide free, trial, or sandbox accounts. Also, tokens for
the API have full access to the account, and so real account owners are
reluctant to provide them.

If you can get valid credentials, see ./jupiterone.md for details on
provisioning the API connection.

## Authentication

To authenticate, present your API token in an Authorization header in requests
(`Authorization: 'Bearer {TOKEN}'`).

The `site` config variable is a modifier to the base URL used for the REST API,
which is `https://${config.site.toLowerCase()}.api.knowbe4.com/v1`. Valid sites
include `us`, `eu`, `uk`, `de` and `ca`. Official documentation stating valid
sites can be found
[here](https://developer.knowbe4.com/graphql/phisher/page/Base-URL)
