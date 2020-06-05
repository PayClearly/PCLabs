const exec = require('child_process').exec;
const path = require('path');

const bootstrap = async (opts = {})=> {
  let externalConfig;

  const options = {
    environment: opts.dryRun === true ? 'test' : 'production',
    domains: opts.domain,
    maintainerEmail: opts.maintainer,
    subscriberEmail: opts.subscriber,
    accountId: opts.accountId,
    accountDetails: opts.accountDetails,
    cwd: opts.cwd,
    subject: opts.subject,
    privateKey: opts.privateKey,
    csr: opts.csr,
  };

  if (opts.plugin) {
    const installDirectory = path.resolve(options.cwd.split('certificator')[0], 'certificator');
    await _execute(`npm install ${opts.plugin}`, installDirectory);
    const packageName = opts.plugin.substring(0, _getPosition(opts.plugin, '@', 2));
    externalConfig = require(packageName);
  } else if (opts.config) {
    externalConfig = resolve(options.cwd, opts.config);
  } else {
    throw new Error('A plugin or config is required to set and remove DNS challenges');
  }

  const config = await Promise.resolve().then(() => externalConfig(options));

  return Object.keys(options).reduce((acc, curr) => {
    if (options[curr] && !acc[curr]) acc[curr] = options[curr];
    return acc;
  }, config);
};

const validate = (type, config) => {
  if (!config.maintainerEmail || typeof config.maintainerEmail !== 'string') throw new Error('Maintainer email required');
  switch (type) {
    case 'account': {
      if (!config.subscriberEmail || typeof config.subscriberEmail !== 'string') throw new Error('Subscriber email required when creating an account');
    }
    case 'certificate': {
      if (!config.fetchAccountDetails || typeof config.fetchAccountDetails !== 'function') throw new Error('fetchAccountDetails callback is required when creating a certificate');
      if (!config.csr && !config.privateKey && (!config.fetchServerPrivateKey || typeof config.fetchServerPrivateKey !== 'function')) throw new Error('A valid server private key or fetchServerPrivateKey callback is required if no CSR is provided');
    }
  }l
};

const resolve = (cwd, relativePath) => {
  try {
    return require(path.resolve(cwd, relativePath))
  } catch(err) {
    throw new Error(`Could not resolve path '${cwd}' Error: ${err.message}`);
  }
};

function _getPosition(str, pat, index) {
  const l = str.length;
  let i = -1;
  while(index-- && i++ < l){
    i = str.indexOf(pat, i);
    if (i < 0) break;
  }
  return i;
}

const _execute = (command, cwd) => {
  return new Promise((resolve, reject) => {
    const cmd = exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(true);
      }
    });

    const consoleOutput = function(msg) {
      console.log('npm: ' + msg);
    };

    cmd.stdout.on('data', consoleOutput);
    cmd.stderr.on('data', consoleOutput);
  });
};

module.exports = {
  bootstrap,
  validate,
  resolve,
};
