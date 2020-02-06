const path = require('path');
const fs = require('fs');
const request = require('request');

const config = require('./config');
const logger = require('./logger');
const utils = require('./utils');
const archive = require('./archive');

module.exports.fetchTarball = async (tarball, destination) => {
  const options = {};
  if (config.token) options.auth = { bearer: config.token };

  logger.debug(`Fetching tarball [${tarball}]`);

  return new Promise((resolve, reject) => {
    request
      .get(tarball, options)
      .on('error', err => {
        err.code = '502';
        reject(err);
      })
      .on('response', ({ statusCode, statusMessage }) => {
        if (statusCode < 200 || statusCode >= 400) {
          const err = new Error(statusMessage);
          err.code = String(statusCode);
          return reject(new Error(statusMessage));
        }
        logger.debug(`Writing tarball to location [${destination}]`);
      })
      .pipe(fs.createWriteStream(destination))
      .on('error', err => reject(err))
      .on('finish', () => resolve());
  });
};

module.exports.fetchPackage = async (scope, name, version) => {
  const options = { json: true };
  if (config.token) options.auth = { bearer: config.token };

  return new Promise((resolve, reject) => {
    request.get(
      `${config.registry.replace(/\/?$/, '')}/${utils.formatNPM(scope, name)}`,
      options,
      (err, res, regData) => {
        if (err) {
          logger.debug(`Package registry [${config.registry}] is not available or is returning an error`);
          err.code = '502';
          reject(err);
        }

        // Handle errors or any status other than OK
        if (regData.error || res.statusCode < 200 || res.statusCode >= 400) {
          const err = new Error(regData.error || res.statusMessage);
          err.code = String(res.statusCode || 502);
          return reject(err);
        }

        // Update missing or latest with actual version
        version = !version || version == 'latest' ? regData['dist-tags'].latest : version;

        // If there is already a cached version quick resolve
        if (fs.existsSync(path.join(config.store, utils.formatPath(scope, name, version))))
          return resolve({ version, cached: true });

        const tarball = regData.versions[version].dist.tarball;
        const destination = path.join(config.tmp, utils.formatPath(scope, name, version) + '.tgz');

        module.exports.fetchTarball(tarball, destination).then(() => resolve({ version, cached: false }));
      },
    );
  });
};

module.exports.fetch = async (scope, name, version) => {
  const id = utils.formatNPM(scope, name, version);

  logger.debug(`Fetching package [${id}] from the package registry [${config.registry}]`);

  return module.exports
    .fetchPackage(scope, name, version)
    .then(({ version, cached }) => {
      if (cached) return { scope, name, version };

      logger.debug(`Received [${id}] archive from the package registry [${config.registry}]`);

      const source = path.join(config.tmp, utils.formatPath(scope, name, version) + '.tgz');
      const destination = path.join(config.store, utils.formatPath(scope, name, version));

      // Extract new package
      return archive.extract(source, destination, true).then(() => ({ scope, name, version }));
    })
    .catch(err => {
      const source = path.join(config.tmp, utils.formatPath(scope, name, version) + '.tgz');
      if (fs.existsSync(source)) {
        logger.debug(`Cleaning up remaining tarball at location [${source}]`);
        fs.unlinkSync(source);
      }
      logger.error(`Failed to fetch [${id}] from the package registry [${config.registry}]`);
      throw err;
    });
};
