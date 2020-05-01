

# PayClearly Labs

This repository is used to manage the public utilities that PayClearly manages. For the most part, the packages contained are helpful, for managing, tracking, and deploying interlinked projects.

Highlights
  - [Creditor](/packages/creditor): A CLI for managing a project's patterns
  - [Gru](/packages/gru): A CLI for managing builds, deployments, and environments via git tags
  - [Minion](/packages/minion):  Use for serving multiple app versions via a single server
  - [Gitit](/packages/gitit): A CLI for parsing out a git trunk branch history to inform deployment/release history

## Contributing

In order to contrigute to this porject you need to have an envronment variable NPM_TOKEN. The npm token is used to identify you with npm. If you don't plan to actually release the app it must at least be set to somthing like XXXXXX. [see this blog article](https://blog.npmjs.org/post/118393368555/deploying-with-npm-private-modules)

Clone and install and run

```
$: npm run lint

```

### Project structure

This is a mono repo that uses [Lerna](https://lerna.js.org/) for keeping track of local dependencies. [This video](https://www.youtube.com/watch?v=Nn8G91x8tJI&app=desktop) was helpful with learning how Lerna works. Lerna must be installed globally.

This mono repo is made up of sub-packages with the following structure. Packages have the same structure as follows

```
--  /packages/[PACKAGE]
  /_  /lib        // contains the packages local utils
  /_  index.js      // the package's entry point
  /_  test.js       // the test file for the package
  /_  readme.md     // the package overview
  /_  cli.js        // if a cli exists it is the cli entry
  /_  package.json    // package dependencies
```

We also use [Creditor](/packages/creditor) for scaffolding out new packages with this structure
```
$: npm run scaffold
```

### Testing/Linting

The following will run the test command across all packages

```
$: npm run lint
$: npm run test
```
