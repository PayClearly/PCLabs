# Gru
## Gru manages code deployment state in monorepos

Gru uses tags to track which version of your code is built and in which environments it is deployed.

The goal is to have your git repo be the single source of truth for the history and state of your code's builds and deployments!

## With Gru think: "BUILD - CACHE - DEPLOY!"

### Usage

1. install 
```
  npm install --save-dev @pclabs/gru
```

2. Add gru script to package.json
```
  ...
  "scripts": {
    ...
    gru: "gru"
  }
```

### Gru's strict assumptions
  - That the code you are ultimately going to deploy can be reduced to a single stateless zip file
    - Examples: docker image, static bundle, cloud function build

### These assumptions mean that in order to use Gru, you have to answer a few questions for us via delegates
  - How do you turn a commit into a build? (wepback, build, docker init, etc.)
  - How can we cache these builds? (aws s4, google cloud bucket, etc.)
    - Once an app is cached the repo will be tagged with the given build prefix
  - How do you deploy a build to a defined ENVIRONMENT?

### Gru will manage Github tags to keep track of
  - Which commits have been built (via the buildTag)
  - Which commits have been deployed to which environments (via the envTag)
  - Which commits have been previously released (via the envTag)

This way the state of your system is always up to date with your commit history.

## Configuration

You will need to export a config file from .gruconfig.js that defines how to deploy each of your apps.


```
  {
    apps: {
      [APPNAME]: {
        name: [APPNAME]
        buildTagPrefix: // the prefix associated with builds.
        envTagPrefix: // the prefix associated with environments,
        envReqTagPrefix: // the prefix associated with environment requests,
        releaseTagPrefix: // the prefix associated with releases requests,
        releaseReqTagPrefix: // the prefix associated with releases requests,

        buildTagPrefix: 
        envTagPrefix: 

        // DELEGATES
        build: async function(buildKey) {
          // this function should build the code and return the local path to where it was built
        },
        cache: async function(buildKey, zipFile) {
          // expected to handle hosting the zipFile somewhere and returning the destination path
        },
      },
    },
    customParser: (custom) => {
      // A function that is called with the cli option --custom
      // This is useful when using CI/CD tools (such as Github Actions) for turning events into easily defined CLI commands. For example:
      //    gru --custom=env_app_prod_key
      // the parser then receives env_app_prod_key and and may convert it into
      //    { app: 'app', cache: 'true', deployTo: 'prod' }
      // which would be equivalent to calling 
      //    gru --app=app cache=true deployTo=prod
      // returns { app, cache, deployTo }
    }
  }
```

## Upcoming Features
- Deployment Management
- Usage of OS .temp directory
- Query remote tags for existing builds, in addition to local repository
