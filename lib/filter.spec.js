jest.mock('./config.js');

const filter = require('./filter');

//------------------------------------------------------------------------------------
// packages
//------------------------------------------------------------------------------------

describe('[Filter]: packages', () => {
  let config = require('./config.js');

  afterEach(() => {
    config.include = undefined;
    config.exclude = undefined;
  });

  it('should allow all packages by default', () => {
    expect(filter.packages('scope$package@1.0.0')).toBe(true);
  });

  it('should allow included packages', () => {
    config.include = 'scope\\$package@1.0.0';
    expect(filter.packages('scope$package@1.0.0')).toBe(true);
  });

  it('should not allow excluded packages', () => {
    config.exclude = 'scope\\$package@1.0.0';
    expect(filter.packages('scope$package@1.0.0')).toBe(false);
  });

  it('should respect advanced patterns', () => {
    config.include = '^scope\\$package@[\\w.]*$';
    expect(filter.packages('scope$package@1.0.0')).toBe(true);
    expect(filter.packages('scope$package@2.0.0')).toBe(true);
  });

  it('should respect multiple include patterns', () => {
    config.include = 'scope\\$package@1.0.0, scope\\$package@2.0.0';
    expect(filter.packages('scope$package@1.0.0')).toBe(true);
    expect(filter.packages('scope$package@2.0.0')).toBe(true);
  });

  it('should respect multiple exclude patterns', () => {
    config.exclude = 'scope\\$package@1.0.0, scope\\$package@2.0.0';
    expect(filter.packages('scope$package@1.0.0')).toBe(false);
    expect(filter.packages('scope$package@2.0.0')).toBe(false);
  });

  it('should allow included, but not excluded packages', () => {
    config.include = 'scope\\$package@[\\w.]*';
    config.exclude = 'scope\\$package@2.0.0';
    expect(filter.packages('scope$package@1.0.0')).toBe(true);
    expect(filter.packages('scope$package@2.0.0')).toBe(false);
  });

  it('should be case insensitive', () => {
    config.include = 'scope\\$package@[\\w.]*';
    config.exclude = 'scope\\$package@2.0.0';
    expect(filter.packages('scope$Package@1.0.0')).toBe(true);
    expect(filter.packages('scope$Package@2.0.0')).toBe(false);
  });
});

//------------------------------------------------------------------------------------
// files
//------------------------------------------------------------------------------------

describe('[Filter]: files', () => {
  let config = require('./config.js');

  afterEach(() => {
    config.include_files = undefined;
    config.exclude_files = undefined;
  });

  it('should allow all files by default', () => {
    expect(filter.files('dist/main.js')).toBe(true);
  });

  it('should allow included files', () => {
    config.include_files = 'dist/main.js';
    expect(filter.files('dist/main.js')).toBe(true);
  });

  it('should not allow excluded files', () => {
    config.exclude_files = 'dist/main.js';
    expect(filter.files('dist/main.js')).toBe(false);
  });

  it('should respect globbing patterns', () => {
    config.include_files = 'dist/**/*.js';
    expect(filter.files('dist/main.js')).toBe(true);
    expect(filter.files('dist/nested/secondary.js')).toBe(true);
  });

  it('should respect multiple include patterns', () => {
    config.include_files = 'dist/main.js, dist/secondary.js';
    expect(filter.files('dist/main.js')).toBe(true);
    expect(filter.files('dist/secondary.js')).toBe(true);
  });

  it('should respect multiple exclude patterns', () => {
    config.exclude_files = 'dist/main.js, dist/secondary.js';
    expect(filter.files('dist/main.js')).toBe(false);
    expect(filter.files('dist/secondary.js')).toBe(false);
  });

  it('should allow included, but not excluded files', () => {
    config.include_files = 'dist/*.js';
    config.exclude_files = 'dist/secondary.js';
    expect(filter.files('dist/main.js')).toBe(true);
    expect(filter.files('dist/secondary.js')).toBe(false);
  });

  it('should be case insensitive', () => {
    config.include_files = 'dist/*.js';
    config.exclude_files = 'dist/secondary.js';
    expect(filter.files('dist/Main.js')).toBe(true);
    expect(filter.files('dist/Secondary.js')).toBe(false);
  });
});
