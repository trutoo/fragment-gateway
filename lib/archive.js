const fs = require('fs');
const zlib = require('zlib');
const tar = require('tar');

const logger = require('./logger');

module.exports.extract = (archive, destination, clean = false) => {
  logger.debug(`Extracting archive [${archive}] to [${destination}]`);

  return new Promise((resolve, reject) => {
    // Remove existing directory
    if (fs.existsSync(destination)) fs.rmdirSync(destination);
    // Create new directory
    fs.mkdirSync(destination);
    // Extract archive to destination
    fs.createReadStream(archive)
      .pipe(zlib.Unzip())
      .pipe(
        tar.extract({
          cwd: destination,
          strip: 1,
        }),
      )
      .on('error', err => {
        logger.error(`Failed to extract archive [${archive}] to [${destination}]`, err);
        reject(err);
      })
      .on('end', data => {
        logger.debug(`Successfully extracted archive [${archive}] to [${destination}]`);
        resolve(data);
      })
      .on('close', () => {
        if (clean) {
          fs.unlink(archive, err => {
            if (err) throw err;
          });
        }
      });
  });
};
