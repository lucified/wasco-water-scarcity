// Configuration for Lucify's GitHub and Flowdock deployment notifications

const lucifyDeployConfig = require('lucify-deploy-config').default; // eslint-disable-line

// TODO: different deployment locations depending on app
const opts = {
  bucket: 'lucify-wasco',
  baseUrl: 'https://wasco.lucify.com',
  publicPath: '/',
};

module.exports = lucifyDeployConfig(null, opts);
