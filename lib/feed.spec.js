jest.mock('fs');
jest.mock('request');
jest.mock('./archive.js');

const path = require('path');

const config = require('./config.js');
const utils = require('./utils.js');
const feed = require('./feed.js');

//------------------------------------------------------------------------------------
// fetchTarball
//------------------------------------------------------------------------------------

describe('[Feed]: fetchTarball', () => {
  let fs = require('fs');
  let request = require('request');

  afterEach(() => {
    request.get.mockClear();
  });

  const baseTest = reqOpts =>
    new Promise((resolve, reject) => {
      const tarball = 'https://registry.com/@scope/package/-/package-1.0.0.tgz';
      const destination = path.join(config.tmp, 'scope$package@1.0.0');

      feed
        .fetchTarball(tarball, destination)
        .then(resolve)
        .catch(reject);

      expect(request.get).toHaveBeenCalledTimes(1);
      expect(request.get).toHaveBeenCalledWith(tarball, expect.objectContaining(reqOpts));
      expect(fs.createWriteStream).toHaveBeenCalledWith(destination);
      request.__emit('finish');
    });

  it('should fetch a tarball of the package', done => {
    baseTest({ auth: {} }).then(() => done());
  });

  it('should fetch a tarball of the package using authentication', done => {
    config.token = 'XXX-XXX';
    baseTest({ auth: { bearer: config.token } }).then(() => done());
    config.token = undefined;
  });
});

//------------------------------------------------------------------------------------
// fetchPackage
//------------------------------------------------------------------------------------

describe('[Feed]: fetchPackage', () => {
  let fs = require('fs');
  let request = require('request');

  beforeEach(() => {
    request.__setBody({
      'dist-tags': {
        latest: '1.0.0',
      },
      versions: {
        '1.0.0': {
          name: '@scope/package',
          version: '1.0.0',
          dist: {
            tarball: 'https://registry.com/@scope/package/-/package-1.0.0.tgz',
          },
        },
      },
    });
  });

  afterEach(() => {
    request.get.mockClear();
  });

  const baseTest = ({ scope, name, version }, reqOpts, cached) =>
    new Promise((resolve, reject) => {
      const fetchTarball = feed.fetchTarball;
      const existsSync = fs.existsSync;
      feed.fetchTarball = jest.fn(() => Promise.resolve());
      fs.existsSync = jest.fn(() => cached);

      feed
        .fetchPackage(scope, name, version)
        .then(({ version, cached }) => {
          if (!cached) {
            expect(feed.fetchTarball).toHaveBeenCalledTimes(1);
            expect(feed.fetchTarball).toHaveBeenCalledWith(
              'https://registry.com/@scope/package/-/package-1.0.0.tgz',
              path.join(config.tmp, utils.formatPath(scope, name, version) + '.tgz'),
            );
          } else {
            expect(feed.fetchTarball).not.toHaveBeenCalled();
          }

          feed.fetchTarball = fetchTarball;
          fs.existsSync = existsSync;
          return { version, cached };
        })
        .then(resolve)
        .catch(reject);

      expect(request.get).toHaveBeenCalledTimes(1);
      expect(request.get).toHaveBeenCalledWith(
        `${config.registry}/${utils.formatNPM(scope, name)}`,
        expect.objectContaining(reqOpts),
        expect.any(Function),
      );
    });

  it('should fetch registry data for package', done => {
    baseTest({ scope: 'scope', name: 'package', version: '1.0.0' }, { auth: {}, json: true }, false).then(
      ({ cached, version }) => {
        expect(version).toBe('1.0.0');
        expect(cached).toBeFalsy();
        done();
      },
    );
  });

  it('should fetch registry data for package using authentication', done => {
    config.token = 'XXX-XXX';
    baseTest(
      { scope: 'scope', name: 'package', version: '1.0.0' },
      { auth: { bearer: config.token }, json: true },
      false,
    ).then(({ cached, version }) => {
      expect(version).toBe('1.0.0');
      expect(cached).toBeFalsy();
      done();
    });
    config.token = undefined;
  });

  it('should fetch registry data for package if version is missing', done => {
    baseTest({ scope: 'scope', name: 'package', version: undefined }, { auth: {}, json: true }, false).then(
      ({ cached, version }) => {
        expect(version).toBe('1.0.0');
        expect(cached).toBeFalsy();
        done();
      },
    );
  });

  it('should fetch registry data for package if version is missing', done => {
    baseTest({ scope: 'scope', name: 'package', version: undefined }, { auth: {}, json: true }, false).then(
      ({ cached, version }) => {
        expect(version).toBe('1.0.0');
        expect(cached).toBeFalsy();
        done();
      },
    );
  });

  it('should not fetch registry data if package is cached', done => {
    baseTest({ scope: 'scope', name: 'package', version: '1.0.0' }, { auth: {}, json: true }, true).then(
      ({ cached, version }) => {
        expect(version).toBe('1.0.0');
        expect(cached).toBeTruthy();
        done();
      },
    );
  });

  it('should fail to get version that does not exist', done => {
    request.__setStatus(404, 'Version 1.1.0 not found');
    baseTest({ scope: 'scope', name: 'package', version: '1.0.0' }, { auth: {}, json: true }, false).catch(err => {
      expect(err.code).toBe('404');
      expect(err.message).toBe('Version 1.1.0 not found');
      done();
    });
  });
});

//------------------------------------------------------------------------------------
// fetchTarball
//------------------------------------------------------------------------------------

describe('[Feed]: fetch', () => {
  let fs = require('fs');
  let archive = require('./archive.js');
  archive.extract = jest.fn(() => Promise.resolve());

  afterEach(() => {
    archive.extract.mockClear();
  });

  const baseTest = cached =>
    new Promise((resolve, reject) => {
      const fetchPackage = feed.fetchPackage;
      feed.fetchPackage = jest.fn(() => Promise.resolve({ version: '1.0.0', cached }));
      feed
        .fetch('scope', 'package', '1.0.0')
        .then(({ scope, name, version }) => {
          expect(scope).toBe('scope');
          expect(name).toBe('package');
          expect(version).toBe('1.0.0');
          return { scope, name, version };
        })
        .then(resolve)
        .catch(reject);
      feed.fetchPackage = fetchPackage;
    });

  it('should extract fetched package if not cached', done => {
    baseTest(false).then(({ scope, name, version }) => {
      const source = path.join(config.tmp, utils.formatPath(scope, name, version) + '.tgz');
      const destination = path.join(config.store, utils.formatPath(scope, name, version));
      expect(archive.extract).toHaveBeenCalledWith(source, destination, true);
      done();
    });
  });

  it('should quick return if cached package exists', done => {
    baseTest(true).then(() => {
      expect(archive.extract).not.toHaveBeenCalled();
      done();
    });
  });
});
