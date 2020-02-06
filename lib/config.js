const path = require('path');
const fs = require('fs');

const config = {
  port: process.env.PORT || 3000,
  registry: process.env.REGISTRY || 'https://registry.npmjs.org',
  token: process.env.REGISTRY_TOKEN,
  logs: path.join(process.cwd(), 'logs'),
  tmp: path.join(process.cwd(), 'tmp'),
  store: path.join(process.cwd(), 'store'),
  allow_latest: process.env.ALLOW_LATEST || false,
  include: process.env.INCLUDE,
  exclude: process.env.EXCLUDE,
  include_files: process.env.INCLUDE_FILES,
  exclude_files: process.env.EXCLUDE_FILES,
};

module.exports = config;
