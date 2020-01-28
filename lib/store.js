const fs = require('fs');
const path = require('path');
const semver = require('semver');

const config = require('./config');
const logger = require('./logger');
const utils = require('./utils');

module.exports.fetch = async (scope, name, version) => {
  const id = utils.formatNPM(scope, name, version);
  const location = path.join(config.store, utils.formatPath(scope, name, version));
  const result = {
    scripts: [],
    styles: [],
    render: '',
  };

  try {
    logger.debug(`Reading stored package [${id}]`);
    const metadata = JSON.parse(fs.readFileSync(path.join(location, 'package.json'), 'utf8'));
    if (metadata.browser) result.scripts = [metadata.browser];
    if (metadata.styles) result.styles = [metadata.styles];
    if (metadata.render) result.render = fs.readFileSync(path.join(location, metadata.render), 'utf8');
    logger.debug(`Successfully read stored package [${id}]`);
  } catch (err) {
    logger.error(`Failed to find package [${id}] or read files`, err);
  }

  return result;
};

module.exports.latest = packages => {
  let latest;
  packages.forEach(path => {
    const { version } = utils.parsePath(path);
    if (semver.gt(version, latest || '0.0.0')) latest = version;
  });
  return latest;
};
