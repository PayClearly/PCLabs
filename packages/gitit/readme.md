# Gitit

A simple cli for grabbing useful information out of your Git commit history and marrying it up with information in your favorite ticketing system.

If you are the type of team that likes to have a single source of truth for the the status of you code as well as the status of your project, this repo may be helpful to you. The idea is that, this single source of truth is your commit history.

## Usage
```
  npm install --save-dev @pclabs/gitit
```

```
  const gitit = require('@pclabs/gitit');

  const instance = gitit(config) // see config below

  instance.parseRepo({})
    .then((repoData) => {
      return instance.parseProject(repoData);
    })
    .then((data) => {
      console.log(data);
    });

```

## Config structure
// TODO

## Backlog
// Make public cli work by importing config as file
// Move inquirer wrapper into own package
// Move pathed JSON into own package... perhaps with test-persistance
// Limit data pulled in by updated date...
