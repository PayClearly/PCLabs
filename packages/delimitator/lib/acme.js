const ACME = require('@root/acme');
const CSR = require('@root/csr');
const PEM = require('@root/pem');
const Keypairs = require('@root/keypairs');
const punycode = require('punycode');
const utils = require('../_utils');
const package = require('../package');

const AcmeWrapper = async (program) => {
  const globalOptions = program.parent.opts();
  const options = program.opts();
  const config = await utils.bootstrap({ ...globalOptions, ...options});

  const acme = ACME.create({
    maintainerEmail: options.maintainerEmail || config.maintainerEmail,
    subscriberEmail: options.subscriberEmail || config.subscriberEmail,
    packageAgent: `${package.name}/${package.version}`,
    notify,
  });

  const letsEncryptEnvironment = globalOptions.dryRun === true ? 'acme-staging-v02.api.letsencrypt.org' : 'acme-v02.api.letsencrypt.org';
  await acme.init(`https://${letsEncryptEnvironment}/directory`);
  config.acme = acme;

  return {
    createAccount: _createAccount(config),
    createCertificate: _createCertificate(config),
  }
};

const _createCertificate = (config) => {
  return async () => {
    let csr;
    if (config.csr) csr = require(config.csr); else csr = await _createCSR(config);
    console.info('validating domain authorization for ' + config.domains.join(' '));

    let accountDetails;
    if (config.accountDetails) accountDetails = utils.resolve(config.cwd || process.cwd, config.accountDetails); else accountDetails = await config.fetchAccountDetails();

    const certificate = await config.acme.certificates.create({
      account: accountDetails.account,
      accountKey: accountDetails.accountKey,
      csr,
      domains: config.domains,
      challenges: { 'http-01': { set: config.setChallenge, remove: config.removeChallenge, get: config.getChallenge } },
    });

    if (config.certificateCreated) await config.certificateCreated(certificate);
  };
};

const _createCSR = async (config) => {
  if (!config.privateKey && !config.fetchServerPrivateKey) throw new Error('Invalid Config. No private key or fetchServerPrivateKey callback provided.');
  const punyDomains = config.domains.map(domain => punycode.toASCII(domain)) || [];

  let serverPem;
  if (config.privateKey) serverPem = utils.resolve(config.cwd || process.cwd, config.privateKey); else serverPem = await config.fetchServerPrivateKey();
  const serverKey = await Keypairs.import({ pem: serverPem });
  const csrDer = await CSR.csr({ jwk: serverKey, domains: punyDomains, encoding: 'der' });

  return PEM.packBlock({ type: 'CERTIFICATE REQUEST', bytes: csrDer });
};

const _createAccount = (config) => {
  return async () => {
    const accountKeypair = await Keypairs.generate({ kty: 'EC', format: 'jwk' });
    const accountKey = accountKeypair.private;

    const account = await config.acme.accounts.create({
      subscriberEmail: config.subscriberEmail,
      maintainerEmail: config.maintainerEmail,
      agreeToTerms: true,
      accountKey
    });

    console.info('created account with id', account.key.kid);
    if (config.accountCreated) await config.accountCreated(account, accountKey);
  }
};

const notify = (event, msg) => {
  if (event === 'certificate_order') console.log(`Ordering new certificate with lets encrypt at account '${msg.account.key.kid}' for '${msg.subject}' using challenge types '${msg.challengeTypes.join(', ')}'`);
  if (event === 'challenge_status') console.log(`Challenge for '${msg.altname}' came back with status '${msg.status}' `);
};

module.exports = AcmeWrapper;
