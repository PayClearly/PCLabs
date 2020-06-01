#!/usr/bin/env node

const program = require('commander');
const ACME = require('../lib/acme');
const pkg = require('../package.json');

const run = async (type, program) => {
  try {
    const acme = await ACME(program);
    if (type === 'account') return await acme.createAccount();
    if (type === 'certificate') return await acme.createCertificate();
  } catch (err) {
    console.error(`Certificator Error: '${err.message}'. Stack: '${err.stack}'`);
    return process.exit(1)
  }
};

const collectDomains = (value, domains) => {
  domains.push(value);
  return domains;
};

program
  .version(pkg.version)
  .arguments('<type>')
  .description('An ACME client for managing accounts and ssl certificates with Let\'s Encrypt certificate authority.')
  .option('-p, --plugin <package>', 'Package name of ACME challenge plugin. Requires user to be logged into git to clone and install.')
  .option('-c, --config <path>', 'Relative path to local js config file.')
  .option('-d, --dry-run', 'Perform a dry run of the application setting Let\'s Encrypt environment to staging.')

program.command('create <type>')
  .description('Create a new ACME account `account` or SSL certificate `certificate` with Let\'s Encrypt.')
  .option('-s, --subscriber <email>', 'Email contact for the service provider to receive renewal failure notices and manage the ACME account.')
  .option('-m, --maintainer <email>', 'Email contact for the author of the code to receive critical bug and security notices.')
  .option('-a, --account-id <value>', 'Let\'s Encrypt Account ID. Only needed if overriding config default account ID.')
  .option('-t, --account-details <path>', 'Relative path to ACME account details JSON. Returned when running `certificator create account`.')
  .option('-w, --cwd <path>', 'Set the current working directory to fetch files from. Defaults to root project directory.', process.cwd())
  .option('-o, --domain <url>', 'The URL to be included in the certificate or managed by the ACME account. Provided multiple domains using multiple option flags.', collectDomains, [])
  .option('-j, --subject <url>', 'The URL of the DNS being challenged.')
  .option('-k, --private-key <path>', 'The server\'s private key used to sign the Certificate Signing Request. Not used if a certificate request is already provided.')
  .option('-r, --csr <path>', 'A Certificate Signing Request to be used to create the final certificate. The server private key option will not be used if a valid CSR is provided.')
  .on('--help', function() {
    console.log('');
    console.log('Examples:');
    console.log('');
    console.log('types: account, certificate');
    console.log('');
    console.log('  $ certificator create account');
    console.log('  $ certificator create certificate');
  })
  .action(run);

program.parseAsync(process.argv);

