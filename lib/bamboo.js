const request = require('request');

const config = require('./config');

module.exports.fetch = async branch => {
  const token = Buffer.from(`${config.bamboo_user}:${config.bamboo_pass}`).toString('base64');
  return new Promise((resolve, reject) => {
    request.get(
      `${config.bamboo}/plan/${branch}.json?os_authType=basic&expand=variableContext`,
      {
        headers: {
          Authorization: `Basic ${token}`,
        },
      },
      (err, res, body) => {
        if (err) return reject(err);
        resolve(JSON.parse(body));
      },
    );
  })
    .then(plan => {
      if (Array.isArray(plan.variableContext.variable)) {
        const port = plan.variableContext.variable.find(variable => variable.key == 'hostPort');
        if (!port.value) return;
        return new Promise((resolve, reject) => {
          request.get(`${config.bamboo_branches}:${port.value}/package.json`, (err, res, body) => {
            if (err) return reject(err);
            resolve({ base: `${config.bamboo_branches}:${port.value}`, metadata: JSON.parse(body) });
          });
        });
      }
    })
    .then(({ base, metadata }) => {
      return new Promise((resolve, reject) => {
        request.get(`${base}/${metadata.render}`, (err, res, body) => {
          if (err) return reject(err);
          const result = {
            scripts: [metadata.browser],
            styles: [metadata.styles],
            render: body,
          };
          resolve(result);
        });
      });
    });
};
