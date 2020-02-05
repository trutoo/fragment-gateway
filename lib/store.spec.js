jest.mock('fs');

const path = require('path');

const config = require('./config.js');
const utils = require('./utils.js');
const store = require('./store.js');

describe('[Store]: fetch', () => {
  let fs = require('fs');
  let metadata;
  let render;
  fs.readFileSync = jest.fn(path => (path.endsWith('package.json') ? metadata : render));

  afterEach(() => {
    metadata = undefined;
    render = undefined;
  });

  it('should retrieve the cached package', done => {
    const location = path.join(config.store, utils.formatPath('scope', 'package', '1.0.0'));
    metadata = JSON.stringify({
      browser: 'scripts.js',
      styles: 'styles.css',
      render: 'render.html',
    });
    render = '<div>render</div>';
    store.fetch('scope', 'package', '1.0.0').then(result => {
      expect(fs.readFileSync).toHaveBeenCalledWith(path.join(location, 'package.json'), 'utf8');
      expect(fs.readFileSync).toHaveBeenCalledWith(path.join(location, 'render.html'), 'utf8');
      expect(result).toEqual({
        scripts: ['scripts.js'],
        styles: ['styles.css'],
        render: '<div>render</div>',
      });
      done();
    });
  });

  it('should fail retrieve a package that does not exist', done => {
    metadata = '';
    store.fetch('scope', 'package', '1.0.0').catch(err => {
      expect(err).toBeTruthy();
      done();
    });
  });
});
