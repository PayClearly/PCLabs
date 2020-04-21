

# PayClearly Labs

This repository is used to manage the public utilities that PayClearly manages. For the most part, the packages contained are helpful, for managing, tracking, and deploying interlinked projects.

Highlights
  - [Creditor](/packages/creditor): A Cli for managing a project's patterns
  - [Gru](/packages/gru): A Cli for managing builds, deployments, and environments via git tags
  - [Minion](/packages/minion):  Use for serving multiple app versions via a single server
  - [Gitit](/pacakges/gitit): A Cli for parsing out a git trunk branch history to inform deployment/release history

## Contibuting

Clone and install and run
```
$: npm run lint
```


### Project structure

This is a mono repo that uses [Lerna](https://lerna.js.org/) for keeping track of local dependancies. [This video](https://www.youtube.com/watch?v=Nn8G91x8tJI&app=desktop) was helpful with learning how Lerna works. Lerna must be installed globally.

This mono repo is made up of sub-packages with the following structure. Packages have the same structure as follows

```
--  /packages/[PACKAGE]
  /_  /lib        // contains the packages local utils
  /_  index.js      // the package's entry point
  /_  test.js       // the test file for the package
  /_  readme.md     // the package overview
  /_  cli.js        // if a cli exists it is the cli entry
  /_  package.json    // package dependancies
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
