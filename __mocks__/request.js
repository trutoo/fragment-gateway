const request = jest.genMockFromModule('request');

let body;
let handlers = {};

request.get = jest.fn((uri, callback) => {
  if (typeof callback === 'function') callback(null, null, body);
  return request;
});

request.on = jest.fn((eventName, handler) => {
  if (!handlers[eventName]) handlers[eventName] = [];
  handlers[eventName].push(handler);
  return request;
});

request.pipe = jest.fn(() => request);

request.__setBody = obj => {
  body = JSON.stringify(obj);
};

request.__emit = event => {
  for (const handler of handlers[event]) handler(body);
};

module.exports = request;
