#!/usr/bin/env node
const gitit = _tryRequire('@pclabs/gitit') || _tryRequire('./');

return gitit.prompt();

function _tryRequire(path) {
  try {
    return require(path);
  } catch (e) {
    return undefined;
  }
}