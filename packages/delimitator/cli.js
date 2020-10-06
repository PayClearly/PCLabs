#!/usr/bin/env node
const delimitator = _tryRequire('@pclabs/delimitator') || _tryRequire('./');
return delimitator;

function _tryRequire(path) {
  try {
    return require(path);
  } catch (e) {
    return undefined;
  }
}
