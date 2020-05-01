#!/usr/bin/env node
const minion = _tryRequire('@pclabs/minion') || _tryRequire('./');

return minion;

function _tryRequire(path) {
  try {
    return require(path);
  } catch (e) {
    return undefined;
  }
}