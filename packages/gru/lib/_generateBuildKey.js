const _generateBuildKey = (config) => {
  return Date.now().toString();
};

module.exports = _generateBuildKey;
