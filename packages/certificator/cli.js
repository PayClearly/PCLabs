#!/usr/bin/env node
const certificator = _tryRequire('@pclabs/certificator') || _tryRequire('./');
return certificator;

function _tryRequire(path) {
  try {
    return require(path);
  } catch (e) {
    return undefined;
  }
}
