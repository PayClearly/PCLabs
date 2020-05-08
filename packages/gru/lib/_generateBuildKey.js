const _generateBuildKey = (delegates, config) => {
  return Date.now().toString();
};

module.exports = _generateBuildKey;
