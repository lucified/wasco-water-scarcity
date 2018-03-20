// Configuration for Lucify's GitHub and Flowdock deployment notifications

const lucifyDeployConfig = require('lucify-deploy-config').default; // eslint-disable-line

const opts = {
  bucket: 'lucify-wasco',
  baseUrl: 'https://wasco.lucify.com',
  publicPath: '/',
};

module.exports = lucifyDeployConfig(null, opts);
