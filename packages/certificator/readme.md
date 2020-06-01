# Certificator
An [ACME](https://tools.ietf.org/html/rfc8555) client for automatically managing accounts and ssl certificates with Let's Encrypt certificate authority.

## Prerequisites
Requires node 10.x.x for updated crypto library.

## Usage
Use `npm link` to locally run the `certificator` command directly from the terminal.

```
  npm install @pclabs/certificator
  npm link
  certificator --help
```

## Configuration
Certificator can be configured using option flags, a config file, and/or a plugin.
 
###Optional flags 
Run `certificator --help` for more information regarding optional flags. Does not support event callbacks.

###Plugin
Use a plugin by providing the `--plugin` option. Plugins are useful if you require external dependencies to properly handle event callbacks. Plugins need to be packages that can be fetched and installed by Certificator.
```
module.exports = class Config {

  // see "certificator create --help" for more information about possible options.
  constructor(option = {}) {
    this.maintainerEmail = option.maintainerEmail || 'austin.dubina@gmail.com';
    this.subscriberEmail = option.subscriberEmail || 'support@payclearly.com';
    this.subject = option.subject || 'payclearly.com';
    this.domains = option.domains || [];
    this.environment = option.environment || 'test';
    this.packageAgent = option.packageAgent || this.environment + '-' + pkg.name + '/' + pkg.version;
    this.accountId = options.accountId || '12345678';
  }

  get set() {
	// { type: 'dns-01'
    // , identifier: { type: 'dns', value: 'foo.example.com' }
    // , wildcard: false
    // , dnsHost: '_acme-challenge.foo.example.com'
    // , dnsPrefix: '_acme-challenge.foo'
    // , dnsZone: 'example.com'
    // , dnsAuthorization: 'zzzz' }
    return async ({ challenge }) => { }
  }

  get get() {
    // { type: 'dns-01'
    // , identifier: { type: 'dns', value: 'foo.example.com' }
    // , altname: '...'
    // , dnsHost: '...'
    // , wildcard: false }
    // Note: query.identifier.value is different for http-01 than for dns-01
    //       because of how a DNS query is different from an HTTP request
    return ({ challenge }) => { };
  }

  get remove() {
    // same options as in set()
    return ({ challenge }) => { }
  }

  async accountCreated(account, accountKey) { }

  certificateCreated(certificate) { }

  async fetchServerPrivateKey() { }

  async fetchAccountDetails() { }

};
```
###Config file
Export a config object and provide Certificator with an absolute path the file using the `--config` flag.

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

    set: ({ challenge }) => Promise.resolve(),

    get: ({ challenge }) => Promise.resolve(),

    remove: ({ challenge }) => Promise.resolve(),

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
|                       | Certificator needs permission to clone and install.                                                         |
| config                | realtive path to a config.js file.                                                                          |
| cwd                   | realtive path to install and load files from. default to process.cwd()                                      |
| privateKey            | realtive path to a JSON file containing the server's private key. Used to sign the CSR.                     |
|                         not used if a valid CSR is provided                                                                         |
| csr                   | realtive path to csr JSON file                                                                              |
```

## Event Callbacks
```
| callback              | Description                                                                                                 |
| ------------------ ---| ----------------------------------------------------------------------------------------------------------- |
| set (required)        | Should make the token url return the key authorization.                                                     |
|                       | i.e. GET http://example.com/.well-known/acme-challenge/xxxx => xxxx.yyyy                                    |
| remove (required)     | remove the previously set token file (just the one)                                                         | 
| get (required)        | confirm the record was set. get the token file via the hosting service API                                  | 
| certificateCreated    | called when certificator has received a signed certificate from Let's Encrypt CA.                           |
| accountCreated        | called when a new account has been created with Let's Encrypt                                               |
| fetchServerPrivateKey | called when creating a new certificate. The server private key is used to sign the CSR                      |
| fetchAccountDetails   | callback to fetch Certificator account Details                                                              |
```

## Tests
```npm run tests```
 
##Legal
This client implementation was built with [ACME.js](https://git.rootprojects.org/root/acme.js) (a [Root](https://rootprojects.org) project).
