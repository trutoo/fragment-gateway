require('dotenv').config();

const fs = require('fs');
const path = require('path');
const express = require('express');
const compression = require('compression');
const cors = require('cors');

const metadata = require('./package.json');
const config = require('./lib/config.js');
const logger = require('./lib/logger.js');
const utils = require('./lib/utils.js');
const filter = require('./lib/filter.js');
const link = require('./lib/link.js');
const feed = require('./lib/feed.js');
const store = require('./lib/store.js');

const app = express();
app.enable('trust proxy');
app.use(compression());
app.use(cors());

//------------------------------------------------------------------------------------
// Package Fetching Requests
//------------------------------------------------------------------------------------

app.get(
  '/fragments/:package*',
  (req, res, next) => {
    let id = req.params.package;
    logger.debug(`Request with path [${req.path}] from [${req.ip}]`);

    try {
      let { version } = utils.parsePath(id);
      if (!config.allow_latest && version == 'latest') {
        logger.debug(
          `Cancelled request for id [${id}] from [${req.ip}], blocked by env 'ALLOW_LATEST: ${config.allow_latest}'`,
        );
        res.send('Latest version is disabled for this gateway instance');
        res.status(403);
        return;
      }

      if (!filter.packages(req.params.package)) {
        logger.debug(
          `Cancelled request for id [${id}] from [${req.ip}], blocked by env 'INCLUDE: ${config.include}' and 'EXCLUDE: ${config.exclude}'`,
        );
        res.send('Package id is outside the specified include and exclude range');
        res.status(403);
        return;
      }

      // All filters pass
      next();
    } catch (err) {
      res.status(parseInt(err.code) || 500);
      res.send(err.message);
      logger.debug(`Failed to serve fragment with id [${id}] to [${req.ip}]`);
    }
  },
  async (req, res, next) => {
    let id = req.params.package;
    try {
      let { scope, name, version } = utils.parsePath(id);

      // If no version is specified check for the latest stored version
      if (!version) {
        const packages = fs
          .readdirSync(config.store)
          .filter(directory => directory.startsWith(utils.formatPath(scope, name)));
        version = store.latest(packages);
        if (version) {
          id = utils.formatPath(scope, name, version);
        }
      }

      // If there is no cached version fetch it from the feed
      if (!fs.existsSync(path.join(config.store, id)))
        ({ scope, name, version } = await feed.fetch(scope, name, version));

      id = utils.formatPath(scope, name, version);

      // If this isn't a direct request to package root send it to the next handler
      if (req.params[0].length) {
        // Rewrite to include version
        req.url = `/fragments/${id}${req.params[0]}`;
        //req.url = req.url.replace('@latest', `@${version}`);
        return next();
      }

      // Retrieve the cached version and return it with headers and body
      const result = await store.fetch(scope, name, version);
      res.setHeader('Link', link.header(`/fragments/${id}`, result));
      res.setHeader('X-Version', version);
      res.send(result.render);
      logger.debug(`Serving fragment with id [${id}] to [${req.ip}]`);
    } catch (err) {
      res.status(parseInt(err.code) || 500);
      res.send(err.message);
      logger.debug(`Failed to serve fragment with id [${id}] to [${req.ip}]`);
    }
  },
);

//------------------------------------------------------------------------------------
// File Fetching Requests
//------------------------------------------------------------------------------------

app.use(
  '/fragments',
  (req, res, next) => {
    const path = req.path.replace(/^\/.*?\//, '');
    if (!filter.files(path)) {
      logger.debug(
        `Cancelled request for file [${path}] from [${req.ip}], blocked by 'INCLUDE_FILES: ${config.include}' and 'EXCLUDE_FILES: ${config.exclude}'`,
      );
      res.send('File path is outside the specified include and exclude range');
      res.status(403);
      return;
    }

    logger.debug(`Serving file [${req.path}] to [${req.ip}]`);
    // All filters pass
    next();
  },
  express.static(config.store, {
    index: false,
    immutable: true,
    maxAge: 1000 * 60 * 60 * 24 * 365, // One year in milliseconds
  }),
);

//------------------------------------------------------------------------------------
// Health Checks
//------------------------------------------------------------------------------------

app.use('/health', (req, res, next) => {
  res.json({ status: 'UP' });
});

//------------------------------------------------------------------------------------
// Initial Listening
//------------------------------------------------------------------------------------

app.listen(config.port || 3000, () => {
  logger.debug(`Starting service on port 3001 running version ${metadata.version}`);
});
