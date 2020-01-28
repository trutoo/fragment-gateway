const link = require('./link.js');

describe('[Link]: header', () => {
  it('should return a valid link header string', () => {
    const header = link.header('', { scripts: ['main.js'], styles: ['main.css'] });
    expect(header).toBe('<main.js>; rel="fragment-script", <main.css>; rel="stylesheet"');
  });

  it('should add a base url to links', () => {
    const header = link.header('/test/', { scripts: ['main.js'], styles: ['main.css'] });
    expect(header).toBe('</test/main.js>; rel="fragment-script", </test/main.css>; rel="stylesheet"');
  });

  it('should return an empty string if there are no scripts or styles', () => {
    const header = link.header('/test/', { scripts: [], styles: [] });
    expect(header).toBeFalsy();
  });
});
