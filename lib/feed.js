const path = require('path');
const fs = require('fs');
const request = require('request');

const config = require('./config');
const logger = require('./logger');
const utils = require('./utils');
const archive = require('./archive');

module.exports.fetch = async (scope, name, version) => {
  const id = utils.formatNPM(scope, name, version);

  logger.debug(`Fetching package [${id}] from the package registry [${config.registry}]`);

  return new Promise((resolve, reject) => {
    request.get(`${config.registry.replace(/\/?$/, '')}/${utils.formatTarball(scope, name)}`, (err, res, body) => {
      if (err) {
        err.code = '404';
        return reject(err);
      }

      let regData;
      try {
        regData = JSON.parse(body);
      } catch (e) {
        logger.debug(`Package registry [${config.registry}] is not available or is returning an error`);
        const err = new Error(`Package registry is not available`);
        err.code = '502';
        return reject(err);
      }
      if (regData.error) {
        const err = new Error(regData.error);
        err.code = '502';
        return reject(err);
      }
      version = !version || version == 'latest' ? regData['dist-tags'].latest : version;

      // If there is already a cached version quick resolve
      if (fs.existsSync(path.join(config.store, utils.formatPath(scope, name, version)))) resolve(true);

      request
        .get(`${config.registry}/${utils.formatTarball(scope, name, version)}`)
        .on('error', err => {
          err.code = '502';
          reject(err);
        })
        .on('response', ({ statusCode, statusMessage }) => {
          if (statusCode !== 200) {
            const err = new Error(statusMessage);
            err.code = String(statusCode);
            reject(new Error(statusMessage));
          }
        })
        .pipe(fs.createWriteStream(utils.formatPath(scope, name, version) + '.tgz'))
        .on('error', err => reject(err))
        .on('finish', () => resolve(false));
    });
  })
    .then(cached => {
      if (cached) return { scope, name, version };

      logger.debug(`Received [${id}] archive from the package registry [${config.registry}]`);

      const source = path.join(process.cwd(), utils.formatPath(scope, name, version) + '.tgz');
      const destination = path.join(config.store, utils.formatPath(scope, name, version));

      // Extract new package
      return archive.extract(source, destination, true).then(() => ({ scope, name, version }));
    })
    .catch(err => {
      const source = path.join(process.cwd(), utils.formatPath(scope, name, version) + '.tgz');
      if (fs.existsSync(source)) fs.unlinkSync(source);
      logger.error(`Failed to fetch [${id}] from the package registry [${config.registry}]`);
      throw err;
    });
};
