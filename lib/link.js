const path = require('path');

module.exports.header = (base, { scripts, styles }) => {
  let link = '';
  link += scripts.map(script => `<${path.join(base, script).replace(/\\+/g, '/')}>; rel="fragment-script"`).join(', ');
  if (link) link += ', ';
  link += styles.map(style => `<${path.join(base, style).replace(/\\+/g, '/')}>; rel="stylesheet"`).join(', ');
  return link;
};
