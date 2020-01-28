const utils = require('./utils.js');

//------------------------------------------------------------------------------------
// parseNPM
//------------------------------------------------------------------------------------

describe('[Utils]: parseNPM', () => {
  it('should extract scope, name, and version from npm id', () => {
    const { scope, name, version } = utils.parseNPM('@scope/package@1.0.0');
    expect(scope).toBe('scope');
    expect(name).toBe('package');
    expect(version).toBe('1.0.0');
  });

  it('should extract scope, name, and version from a complex npm id', () => {
    const { scope, name, version } = utils.parseNPM('@scope/package@1.0.0-beta.2');
    expect(scope).toBe('scope');
    expect(name).toBe('package');
    expect(version).toBe('1.0.0-beta.2');
  });

  it('should extract name from a simple npm id', () => {
    const { scope, name, version } = utils.parseNPM('package');
    expect(scope).toBeFalsy();
    expect(name).toBe('package');
    expect(version).toBeFalsy();
  });
});

//------------------------------------------------------------------------------------
// formatNPM
//------------------------------------------------------------------------------------

describe('[Utils]: formatNPM', () => {
  it('should format scope, name, and version into a npm id', () => {
    const id = utils.formatNPM('scope', 'package', '1.0.0');
    expect(id).toBe('@scope/package@1.0.0');
  });

  it('should format scope, name, and version into a complex npm id', () => {
    const id = utils.formatNPM('scope', 'package', '1.0.0-beta.2');
    expect(id).toBe('@scope/package@1.0.0-beta.2');
  });

  it('should format name into a simple npm id', () => {
    const id = utils.formatNPM(undefined, 'package', undefined);
    expect(id).toBe('package');
  });
});

//------------------------------------------------------------------------------------
// parsePath
//------------------------------------------------------------------------------------

describe('[Utils]: parsePath', () => {
  it('should extract scope, name, and version from path id', () => {
    const { scope, name, version } = utils.parsePath('scope$package@1.0.0');
    expect(scope).toBe('scope');
    expect(name).toBe('package');
    expect(version).toBe('1.0.0');
  });

  it('should extract scope, name, version from a complex path id', () => {
    const { scope, name, version } = utils.parsePath('scope$package@1.0.0-beta.2');
    expect(scope).toBe('scope');
    expect(name).toBe('package');
    expect(version).toBe('1.0.0-beta.2');
  });

  it('should extract name from a simple path id', () => {
    const { scope, name, version } = utils.parsePath('package');
    expect(scope).toBeFalsy();
    expect(name).toBe('package');
    expect(version).toBeFalsy();
  });
});

//------------------------------------------------------------------------------------
// formatPath
//------------------------------------------------------------------------------------

describe('[Utils]: formatPath', () => {
  it('should format scope, name, and version into a path id', () => {
    const id = utils.formatPath('scope', 'package', '1.0.0');
    expect(id).toBe('scope$package@1.0.0');
  });

  it('should format scope, name, and version into a complex path id', () => {
    const id = utils.formatPath('scope', 'package', '1.0.0-beta.2');
    expect(id).toBe('scope$package@1.0.0-beta.2');
  });

  it('should format name into a simple path id', () => {
    const id = utils.formatPath(undefined, 'package', undefined);
    expect(id).toBe('package');
  });
});

//------------------------------------------------------------------------------------
// formatTarball
//------------------------------------------------------------------------------------

describe('[Utils]: formatTarball', () => {
  it('should format scope, name, and version into a path id', () => {
    const id = utils.formatTarball('scope', 'package', '1.0.0');
    expect(id).toBe('@scope%2fpackage/-/package-1.0.0.tgz');
  });

  it('should format scope, name, and version into a complex path id', () => {
    const id = utils.formatTarball('scope', 'package', '1.0.0-beta.2');
    expect(id).toBe('@scope%2fpackage/-/package-1.0.0-beta.2.tgz');
  });

  it('should format name into a simple path id', () => {
    const id = utils.formatTarball('scope', 'package', undefined);
    expect(id).toBe('@scope%2fpackage');
  });

  it('should format name into a path id', () => {
    const id = utils.formatTarball(undefined, 'package', undefined);
    expect(id).toBe('package');
  });
});
