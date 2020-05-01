#!/usr/bin/env node

const <%= short_name %> = _tryRequire('@pclabs/<%= short_name %>') || _tryRequire('.');;

return <%= short_name %>;

function _tryRequire(path) {
  try {
    return require(path);
  } catch (e) {
    return undefined;
  }
}