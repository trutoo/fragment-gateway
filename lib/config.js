const path = require('path');
const fs = require('fs');

const config = {
  registry: process.env.REGISTRY || 'https://registry.npmjs.org',
  cwd: process.env.WORKING_DIR || path.join(process.cwd(), 'tmp'),
  store: process.env.PACKAGE_STORE || path.join(process.cwd(), 'store'),
  allow_latest: process.env.ALLOW_LATEST || false,
  include: process.env.INCLUDE,
  exclude: process.env.EXCLUDE,
  include_files: process.env.INCLUDE_FILES,
  exclude_files: process.env.EXCLUDE_FILES,
  bamboo: process.env.BAMBOO,
  bamboo_branches: process.env.BAMBOO_BRANCHES,
  bamboo_user: process.env.BAMBOO_USER,
  bamboo_pass: process.env.BAMBOO_PASS,
};

// Change the working directory to config cwd
try {
  if (!fs.existsSync(config.cwd)) fs.mkdirSync(config.cwd);
  process.chdir(config.cwd);
} catch (err) {
  console.error('Could not change working directory', err);
}

module.exports = config;
