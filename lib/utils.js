/**
 * @typedef {object} IPackageParts
 * @property {string} scope the package scope for grouping packages
 * @property {string} name the package name
 * @property {string} version the package version
 */

const semver = require('semver');
semver;

module.exports.NPMPattern = /^(?:@([\w_-]+)\/)?([\w._-]+)(?:@([\w._-]+))?$/;

module.exports.PathPattern = /^(?:([\w_-]+)\$)?([\w._-]+)(?:@(.+))?$/;

/** Parse a NPM package id extracting scope, name, and version.
 * @param {string} id the NPM formatted id `@scope/name@1.2.3`
 * @returns {IPackageParts}
 */
module.exports.parseNPM = id => {
  let match = id.match(module.exports.NPMPattern);
  if (!match) {
    const err = new Error(`Package ${id} does not adhere to package naming convention.
    Only alphanumeric, at sign, forward slash, dot, hyphen, and underscore characters are allowed.`);
    err.code = '400';
    throw err;
  }
  return { scope: match[1], name: match[2], version: match[3] };
};

/** Formatting a NPM id from [scope], name, and [version].
 * @param {string} [scope] the package scope for grouping packages
 * @param {string} name the package name
 * @param {string} [version] the package version
 * @returns {string} the returned formatted id __&#064;scope/name&#064;1.2.3__
 */
module.exports.formatNPM = (scope, name, version) => {
  return `${scope ? `@${scope}/` : ''}${name}${version ? '@' + version : ''}`;
};

/** Parse a path package id extracting scope, name, and version.
 * @param {string} id the path formatted id __scope$name&#064;1.2.3__
 * @returns {IPackageParts}
 */
module.exports.parsePath = id => {
  let match = id.match(module.exports.PathPattern);
  if (!match) {
    const err = new Error(`Package ${id} does not adhere to package naming convention.
    Only alphanumeric, dot, hyphen, and underscore characters are allowed in scope and name.`);
    err.code = '400';
    throw err;
  }
  const version = match[3] ? decodeURIComponent(match[3]) : undefined;
  if (version && !semver.validRange(version)) {
    const err = new Error(`Version ${version} does not adhere to semver range convention.`);
    err.code = '400';
    throw err;
  }
  return { scope: match[1], name: match[2], version };
};

/** Formatting a path id from [scope], name, and [version].
 * @param {string} [scope] the package scope for grouping packages
 * @param {string} name the package name
 * @param {string} [version] the package version range following [semver](https://github.com/npm/node-semver)
 * @returns {string} the returned formatted id __scope$name&#064;1.2.3__
 */
module.exports.formatPath = (scope, name, version) => {
  if (version && !semver.validRange(version)) {
    const err = new Error(`Version ${version} does not adhere to semver range convention.`);
    err.code = '400';
    throw err;
  }
  return `${scope ? `${scope}$` : ''}${name}${version ? '@' + encodeURIComponent(version) : ''}`;
};
