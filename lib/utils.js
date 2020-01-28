/**
 * @typedef {object} IPackageParts
 * @property {string} scope the package scope for grouping packages
 * @property {string} name the package name
 * @property {string} version the package version
 *
 * @typedef {object} IPackageBranch
 * @property {string} branch the package for branched containers
 */

module.exports.NPMPattern = /^(?:@([\w_-]+)\/)?([\w._-]+)(?:@([\w._-]+))?$/;

module.exports.PathPattern = /^(?:([\w_-]+)\$)?([\w._-]+)(?:@([\w._-]+))?(?:!([\w_-]+))?$/;

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

/** Parse a path package id extracting scope, name, version, and branch.
 * @param {string} id the path formatted id __scope$name&#064;1.2.3!branch__
 * @returns {IPackageParts & IPackageBranch}
 */
module.exports.parsePath = id => {
  let match = id.match(module.exports.PathPattern);
  if (!match) {
    const err = new Error(`Package ${id} does not adhere to package naming convention.
    Only alphanumeric, dot, hyphen, and underscore characters are allowed.`);
    err.code = '400';
    throw err;
  }
  return { scope: match[1], name: match[2], version: match[3], branch: match[4] };
};

/** Formatting a path id from [scope], name, [version], and [branch].
 * @param {string} [scope] the package scope for grouping packages
 * @param {string} name the package name
 * @param {string} [version] the package version
 * @param {string} [branch] the package for branched containers
 * @returns {string} the returned formatted id __scope$name&#064;1.2.3!branch__
 */
module.exports.formatPath = (scope, name, version, branch) => {
  return `${scope ? `${scope}$` : ''}${name}${version ? '@' + version : ''}${branch ? '!' + branch : ''}`;
};

/** Formatting a path id from [scope], name, and [version].
 * @param {string} [scope] the package scope for grouping packages
 * @param {string} name the package name
 * @param {string} [version] the package version
 * @returns {string} the returned formatted id __&#064;scope%2fname/-/name-1.2.3.tgz__ or __&#064;scope%2fname__ if no version specified
 */
module.exports.formatTarball = (scope, name, version) => {
  return `${scope ? `@${scope}%2f` : ''}${name}${version ? `/-/${name}-${version}.tgz` : ''}`;
};
