# Delimitator
An [ACME](https://tools.ietf.org/html/rfc8555) client for automatically managing accounts and ssl certificates with Let's Encrypt certificate authority.

## Usage

```
  npm install -g @pclabs/delimitator
  delimitator --help
```

## Configuration
Delimitator can be configured using the `--plugin` or `--config` option flags.
 
Use the `--plugin` flag if you require external dependencies to properly handle event callbacks. Plugins need to be packages that can be fetched and installed by Delimitator.

`--plugin @payclearly/acme-http-01-minion@1.0.3`

Alternatively, use the `--config` flag to provide an absolute path JavaScript file that exports a config object.
By default the current working directory is set to the root of this project. This can be changed using the `--cwd` flag.

`--config ./config.js`

#### Example:
```
module.exports = (options) => {

  return {
    plugin: options.plugin,
    config: options.config,
    environment: options.dryRun ? 'test' : 'production',
    packageAgent: `${package.name}/${package.version}`,
    domains: options.domain || [],
    maintainerEmail: options.maintainer,
    subscriberEmail: options.subscriber,
    accountId: options.accountId,
    accountDetails: options.accountDetails,
    cwd: options.cwd,
    subject: options.subject,
    privateKey: options.privateKey,
    csr: options.csr,

    setChallenge: ({ challenge }) => Promise.resolve(),

    getChallenge: ({ challenge }) => Promise.resolve(),

    removeChallenge: ({ challenge }) => Promise.resolve(),

    accountCreated: (account, accountKey) => Promise.resolve(),

    certificateCreated: (certificate) => Promise.resolve(),

    fetchServerPrivateKey: () => Promise.resolve(),

    fetchAccountDetails: () => Promise.resolve()
  }
};
```

## Parameters
```
| Parameter             | Description                                                                                                 |
| ----------------------| ----------------------------------------------------------------------------------------------------------- |
| accountDetails        | an object containing the Let's Encrypt Account ID as "kid" (misnomer, not actually a key id/thumbprint)     |
|                       | and an RSA or EC public/private keypair in JWK format.                                                      |
| accountId             | a unique 8 digit id assigned by Let's Encrypt                                                               |
| accountKey            |                                                                                                             |
| certificate           |                                                                                                             |
| environment           | sets Let's Encrypt Directory URL. https://acme-staging-v02.api.letsencrypt.org/directory by default         |
| subject               | the domain of the DNS being challenged                                                                      |
| domains               | domain(s) that are listed in the CSR and will be listed on the certificate                                  |
| maintainerEmail       | should be a contact for the author of the code to receive critical bug and security notices                 |
| subscriberEmail       | should be a contact for the service provider to receive renewal failure notices and manage the ACME account |
| challenge             | object containing the challenge url and token                                                               |
| packageAgent          | an RFC72321-style user-agent string to append to the ACME client (ex: mypackage/v1.1.1)                     |
| plugin                | published npm package name to be install and used.                                                          |
|                       | Delimitator needs permission to clone and install.                                                         |
| config                | realtive path to a config.js file.                                                                          |
| cwd                   | realtive path to install and load files from. default to process.cwd()                                      |
| privateKey            | realtive path to a JSON file containing the server's private key. Used to sign the CSR.                     |
|                         not used if a valid CSR is provided                                                                         |
| csr                   | realtive path to csr JSON file                                                                              |
```

## Event Callbacks
```
| callback                  | Description                                                                                                 |
| --------------------------| ----------------------------------------------------------------------------------------------------------- |
| setChallenge (required)   | Should make the token url return the key authorization.                                                     |
|                           | i.e. GET http://example.com/.well-known/acme-challenge/xxxx => xxxx.yyyy                                    |
| removeChallenge (required)| remove the previously set token file (just the one)                                                         | 
| getChallenge (required)   | confirm the record was set. get the token file via the hosting service API                                  | 
| certificateCreated        | called when Delimitator has received a signed certificate from Let's Encrypt CA.                           |
| accountCreated            | called when a new account has been created with Let's Encrypt                                               |
| fetchServerPrivateKey     | called when creating a new certificate. The server private key is used to sign the CSR                      |
| fetchAccountDetails       | callback to fetch Delimitator account Details                                                              |
```

## Tests
```npm run tests```
 
##Legal
This client implementation was built with [ACME.js](https://git.rootprojects.org/root/acme.js) (a [Root](https://rootprojects.org) project).
