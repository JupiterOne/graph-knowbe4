# JupiterOne Integration

Learn about the data ingested, benefits of this integration, and how to use it
with JupiterOne in the [integration documentation](docs/jupiterone.md).

## Development

### Prerequisites

1. Install [Node.js](https://nodejs.org/) using the
   [installer](https://nodejs.org/en/download/) or a version manager such as
   [nvm](https://github.com/nvm-sh/nvm) or [fnm](https://github.com/Schniz/fnm).
2. Install [`yarn`](https://yarnpkg.com/getting-started/install) or
   [`npm`](https://github.com/npm/cli#installation) to install dependencies.
3. Install dependencies with `yarn install`.
4. Register an account in the system this integration targets for ingestion and
   obtain API credentials.
5. `cp .env.example .env` and add necessary values for runtime configuration.

   When an integration executes, it needs API credentials and any other
   configuration parameters necessary for fetching data from the provider. The
   names of these parameters are defined in `src/instanceConfigFields.ts`. When
   executed in a development environment, values for these parameters are read
   from Node's `process.env`, loaded from `.env`. That file has been added to
   `.gitignore` to avoid committing credentials.

### Running the integration

1. `yarn start` to collect data
2. `yarn graph` to show a visualization of the collected data
3. `yarn j1-integration -h` for additional commands

### Making Contributions

Start by taking a look at the source code. The integration is basically a set of
functions called steps, each of which ingests a collection of resources and
relationships. The goal is to limit each step to as few resource types as
possible so that should the ingestion of one type of data fail, it does not
necessarily prevent the ingestion of other, unrelated data. That should be
enough information to allow you to get started coding!

See the
[SDK development documentation](https://github.com/JupiterOne/sdk/blob/master/docs/integrations/development.md)
for a deep dive into the mechanics of how integrations work.

See [docs/development.md](docs/development.md) for any additional details about
developing this integration.

### Changelog

The history of this integration's development can be viewed at
[CHANGELOG.md](CHANGELOG.md).

### Versioning this project

To version this project and tag the repo with a new version number, run the
following (where `major.minor.patch` is the version you expect to move to):

```sh
git checkout -b release-<major>.<minor>.<patch>
vim CHANGELOG.md # remember to update CHANGELOG.md with version & date!
git add CHANGELOG.md
yarn version
git push --follow-tags -u origin release-<major>.<minor>.<patch>
```

**NOTE:** It is _critical_ that the tagged commit is the _last_ commit before
merging to main. If any commit is added _after_ the tagged commit, the project
will not be published to NPM.

**NOTE:** Make sure you select the _Create a merge commit_ option when merging
the PR for your release branch. Otherwise the publishing workflow will error
out.

**TIP:** We recommend updating your global `~/.gitconfig` with the
`push.followTags = true` property. This will automatically add the
`--follow-tags` flag to any new commits. See
<https://git-scm.com/docs/git-config#Documentation/git-config.txt-pushfollowTags>

```
[push]
	followTags = true
```

After the PR is merged to the main branch, the
[**Build** github workflow](./.github/workflows/build.yml) should run the
**Publish** step to publish this project to NPM.
