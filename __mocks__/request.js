const request = jest.genMockFromModule('request');

let body;
let status = { statusCode: 200, statusMessage: 'ok' };
let handlers = {};

request.get = jest.fn((uri, options, callback) => {
  if (typeof callback === 'function') callback(null, status, body);
  return request;
});

request.on = jest.fn((eventName, handler) => {
  if (!handlers[eventName]) handlers[eventName] = [];
  handlers[eventName].push(handler);
  return request;
});

request.pipe = jest.fn(() => request);

request.__setStatus = (code, message) => {
  status = { statusCode: code, statusMessage: message };
};

request.__setBody = obj => {
  body = obj;
};

request.__emit = event => {
  for (const handler of handlers[event]) handler(body);
};

module.exports = request;
