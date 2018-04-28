// Configuration for Lucify's GitHub and Flowdock deployment notifications

const lucifyDeployConfig = require('lucify-deploy-config').default; // eslint-disable-line

const opts = {
  bucket:
    process.env.APP === 'embed'
      ? 'lucify-wasco-embed'
      : process.env.APP === 'future' ? 'lucify-wasco-future' : 'lucify-wasco',
  baseUrl:
    process.env.APP === 'embed'
      ? 'https://wasco-embed.lucify.com'
      : process.env.APP === 'future'
        ? 'https://wasco-future.lucify.com'
        : 'https://wasco.lucify.com',
  publicPath: '/',
};

module.exports = lucifyDeployConfig(null, opts);
