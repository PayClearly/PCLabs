# Delimitator
A node package and cli for generating fixed width files from csvs. Delimitator intakes your csv and a configuration file and outputs automatically formatted fixed width files.

## Usage

```
  npm install -g @pclabs/delimitator
  delimitator --help
```
As a CLI
```
  delimitator your_csv.csv your_config.js
```

As a Node package
```
  const delimitator = require('@pclabs/delimitator/methods/preferedMethod');
  const config = require('/path/to/your/config');
  const csv = require('/path/to/your/csv');

  const fixedWidth = await delimitator(csv, config);
```

## Configuration
Delimitator can be configured at runtime by passing in a configuration file as the second arguement.
 
Your configuration should be a .js file, as some of the values you can pass in can be functions. You config file should export an object like the following:
```
module.exports = {
  headerSchema,
  headerValues,
  bodySchema,
  footerSchema,
  footerValues,
  outputFileName: 'desiredFileName', // required if you are using Delimitator as a CLI
};
```

Schema objects define how output fields will be formatted. Delimitator will intake your CSV/values objects and will automatically format the values into defined lengths. Your schema objects will have keys that associate to columns in your csv, and values that are integers defining how many characters that field can possibly be. Fields will automatically have spaces entered to meet the length defined in your schema, this way Delimitator alway produces files with the correct amount of characters per line. Inputs that exceed the length defined iny our schema will throw a useful error message about what field was rejected.

Schema object definition:

```
{
  'PREPEND LINE': String, // Define a string value that will prepend any lines utilizing this schema
  'KEY': Integer // A key that associates to your value objects or csv. The integer determines how long of a field will be generated when processing this value.
  'APPEND LINE': String // Define a string value that will append any lines utilizing this schema
}
```

Values objects are different, and are used to generate header and footer values for your generated fixed width file. Note that there are only header and footer values objects, thats because the body values will be read off of your csv. Often with fixed width files we want to generate additional information (such as the date the file was created) and put it in the header, and so we use the header and footer values objects to provide values to our schemas.

Value object definition:

```
{
  'KEY': String or Function // A key that detmerines what schema field this value will validate against. Functions should be used when dynamic values are wanted, such as todays date.
}
```

#### Configurtion Example:
```
const headerSchema = {
  'PREPEND LINE': 'H',
  'HEADER': 6,
  'WORK DATE': 8,
  'APPEND LINE': 'E',
};

const headerValues = {
  'HEADER': 'HEADER',
  'TRANSMIT DATE': () => {
    const [year, month, day] = (new Date()).toISOString().split('T')[0].split('-');
    return `${month}${day}${year}`;
  },
  'WORK DATE': () => {
    const [year, month, day] = (new Date()).toISOString().split('T')[0].split('-');
    return `${month}${day}${year}`;
  },
};

const footerSchema = {
  'PREPEND LINE': 'T',
  'TRAILER': 7,
};

const footerValues = {
  'TRAILER': 'TRAILER',
};

const bodySchema = {
  'PREPEND LINE': 'D',
  'FIRST NAME': 50,
  'LAST NAME': 50,
  'ADDRESS LINE 1': 100,
  'ADDRESS LINE 2': 100,
  'CITY': 50,
  'STATE': 2,
  'ZIP': 5,
  'COUNTRY': 2,
  'ACCOUNT ID': 30,
};

module.exports = {
  headerSchema,
  headerValues,
  bodySchema,
  footerSchema,
  footerValues,
};
```

