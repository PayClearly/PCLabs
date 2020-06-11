# Creditor

Creditor is used for maintaining and scaffolding boiler plate template code within a repository. Once templates are defined, Creditor makes it easy to create, rename, moved, analyze and used generated code.

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

In order to get the full utility out of Creditor you will need to reconsider how you import and use scaffolded code. Creditor uses the structure of you files to infer the structure of your components.

We recomend you use creditors importer and pass the context to it. You'll need to add the following to the directoy you wish to export

```
  const importer = require('@pclabs/creditor/import.js');
  const context = require.context('./', true, /\.js$/));

  export default importer(context
```



## Example
// TODO

# Backlog
- Create export dir Project in PCLabs
- Document example
- Better analysis tools
- Manifest uploading