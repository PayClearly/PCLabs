// const lib = require('./lib');

function <%= name %>(options = {}) {

  return {
    name: () => { return '<%= short_name %>'; },
  };
}

module.exports = <%= name %>;
