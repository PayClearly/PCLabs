# Creditor

Creditor is used for maintaining and scaffolding boiler plate template code within a repository. Once templates are defined, Creditor makes it easy to create, rename, move, analyze and used generated code.

Creditor uses the structure of the file system for defining how components should be used.

## Usage
```
  npm install --save @pclabs/creditor
```

### /creditor/config.js

/creditor/config.js is used to overwrite Creditor defaults
```
// config.js
module.exports = {
  output: './temp', // the relative output of the templates
};
```

## Using Defined templates

In order to get the full utility out of Creditor you will need to reconsider how you import and use scaffolded code. CommonJS is recommend here as it works for many more versions of NodeJS. Creditor uses the structure of you files to infer the structure of your components.

We recomend you use creditors importer and pass the context to it. You'll need to add the following to the directoy you wish to export

In the top of your soruce

```
  require.context = require('@pclabs/creditor/context.js')
  const src = require('@pclabs/creditor/import.js')(require.context(__dirname || './', true, /\.js$/));
  module.exports = src;
```

## Example
// TODO

# Backlog
- Create export dir Project in PCLabs
- Document example
- Better analysis tools
- Manifest uploading