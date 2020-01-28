const minimatch = require('minimatch');

const config = require('./config.js');

const options = {
  nocase: true,
};

module.exports.packages = id => {
  const include = config.include ? config.include.split(',').map(include => include.trim().replace(/^\//, '')) : [];
  const exclude = config.exclude ? config.exclude.split(',').map(exclude => exclude.trim().replace(/^\//, '')) : [];
  let allowed = true;
  if (include.length) allowed = include.some(include => new RegExp(include, 'i').test(id));
  if (exclude.length) allowed = exclude.every(exclude => !new RegExp(exclude, 'i').test(id));
  return allowed;
};

module.exports.files = path => {
  const include = config.include_files
    ? config.include_files.split(',').map(include => include.trim().replace(/^\//, ''))
    : [];
  const exclude = config.exclude_files
    ? config.exclude_files.split(',').map(exclude => exclude.trim().replace(/^\//, ''))
    : [];
  let allowed = true;
  if (include.length) allowed = include.some(include => minimatch(path, include, options));
  if (exclude.length) allowed = exclude.every(exclude => !minimatch(path, exclude, options));
  return allowed;
};
