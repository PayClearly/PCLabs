module.exports = async (options) => {

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

    set: ({ challenge }) => Promise.resolve('setter called'),

    get: ({ challenge }) => Promise.resolve('getter called'),

    remove: ({ challenge }) => Promise.resolve('remove called called'),

    accountCreated: (account, accountKey) => Promise.resolve('account created'),

    certificateCreated: (certificate) => Promise.resolve('certificate created'),

    fetchServerPrivateKey: () => Promise.resolve('fetched server key'),

    fetchAccountDetails: () => Promise.resolve('fetched account details')
  }
};
