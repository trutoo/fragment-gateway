jest.mock('fs');
jest.mock('request');
jest.mock('./archive.js');

const path = require('path');

const config = require('./config.js');
const utils = require('./utils.js');
const feed = require('./feed.js');

describe('[Feed]: fetch', () => {
  let fs = require('fs');
  let request = require('request');
  let archive = require('./archive.js');
  archive.extract = jest.fn(() => Promise.resolve());

  beforeEach(() => {
    request.__setBody({
      'dist-tags': {
        latest: '1.0.0',
      },
      versions: {
        '1.0.0': {
          name: '@scope/package',
          version: '1.0.0',
        },
      },
    });
  });

  it('should get latest version when no version is specified', done => {
    feed.fetch('scope', 'package').then(() => {
      expect(request.get).toHaveBeenCalledWith(
        `${config.registry}/${utils.formatTarball('scope', 'package', '1.0.0')}`,
      );
      const source = path.join(process.cwd(), utils.formatPath('scope', 'package', '1.0.0') + '.tgz');
      const destination = path.join(config.store, utils.formatPath('scope', 'package', '1.0.0'));
      expect(archive.extract).toHaveBeenCalledWith(source, destination, true);
      archive.extract.mockClear();
      done();
    });

    expect(request.get).toHaveBeenCalledWith(
      `${config.registry}/${utils.formatTarball('scope', 'package')}`,
      expect.any(Function),
    );
    request.__emit('finish');
  });

  it('should get identify version when using latest tag', done => {
    feed.fetch('scope', 'package', 'latest').then(() => {
      expect(request.get).toHaveBeenCalledWith(
        `${config.registry}/${utils.formatTarball('scope', 'package', '1.0.0')}`,
      );
      const source = path.join(process.cwd(), utils.formatPath('scope', 'package', '1.0.0') + '.tgz');
      const destination = path.join(config.store, utils.formatPath('scope', 'package', '1.0.0'));
      expect(archive.extract).toHaveBeenCalledWith(source, destination, true);
      archive.extract.mockClear();
      done();
    });

    expect(request.get).toHaveBeenCalledWith(
      `${config.registry}/${utils.formatTarball('scope', 'package')}`,
      expect.any(Function),
    );
    request.__emit('finish');
  });

  it('should get identify version when using latest tag and is cached', done => {
    const existsSync = fs.existsSync;
    fs.existsSync = jest.fn(() => true);

    feed.fetch('scope', 'package', 'latest').then(() => {
      expect(request.get).toHaveBeenCalledWith(
        `${config.registry}/${utils.formatTarball('scope', 'package', '1.0.0')}`,
      );
      expect(archive.extract).not.toHaveBeenCalled();
      done();
    });

    fs.existsSync = existsSync;
    request.__emit('finish');
  });

  it('should fail to get version that does not exist', done => {
    request.__setBody({
      statusCode: 404,
      statusMessage: 'Version 1.1.0 not found',
    });
    feed.fetch('scope', 'package', '1.1.0').catch(err => {
      expect(request.get).toHaveBeenCalledWith(
        `${config.registry}/${utils.formatTarball('scope', 'package', '1.1.0')}`,
      );
      done();
    });
    request.__emit('response');
  });
});
