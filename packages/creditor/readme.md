# Creditor

Creditor is used to for maintaining and scaffolding boiler plate pattern code within a repository. Once templates are defined, Creditor makes it easy create, rename, moved, analyze and used these templates.

Creditor also uses the structure of the file system for defining how components should be used.

## Usage
```
  npm install --save @pclabs/creditor
```

## Defining templates

Creditor expects there to be a /creditor directory in the given project. This directory is where Creditor is configured and where templates are defined.

### ./creditor structure

The directory /creditor needs to be sturctured as follows
```
  /_ package.json
  /_ creditor
    /_ templates
      /_ [PATTERN_TYPE]
        /_ ...
        /_ files that will be scaffolded
    /_ config.js
```

Once a [PATTERN_TYPE] is defined you may create this pattern in your repository by using the creditor cli. It is recommended that you add a line to your package.json file in order to do so.

Add to package.json:
```
  scripts: {
    ...
    "scaffold": 'node creditor',
  }
```

Once added, defined templates can be managed by calling:
```
  $: npm run scaffold
```

The cli will then prompt for the information needed to scaffold a given pattern.

templates are outputted to whatever output directory defined in config.js.

### /creditor/config.js

/creditor/config.js is used to overwrite Creditor defaults
```
// config.js
module.exports = {
  output: './temp', // the relative output of the templates
};
```

## Using Defined templates

In order to get the full utility out of Creditor you will need to reconsider how you import and use scaffolded templates. Creditor uses the structure of you files to infer the structure of your components.

Within code you wish to use scaffolded components, you'll need to do the following.

```
  const { Mytemplates } = require('@pclabs/creditor/import')
  
  // All of the items of the 'myPattern' type will be imported and accessable in the same way they are structured in the file system
  
  // if a pattern of type 'myPattern' named 'dope' and in location /mytemplates/some/nested/location/dope then it would be acceasble as follows
  const dope = Mytemplates.some.nested.location.dope;
```


## Example
// TODO

# Backlog
- Document example
- Better analysis tools
- Manifest uploading