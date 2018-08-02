// Configuration for Lucify's GitHub and Flowdock deployment notifications

const lucifyDeployConfig = require('lucify-deploy-config').default; // eslint-disable-line

let bucket, baseUrl;
switch (process.env.APP) {
  case 'embed':
    bucket = 'lucify-wasco-embed';
    baseUrl = 'https://embed.waterscarcityatlas.org';
    break;
  case 'future':
    bucket = 'lucify-wasco-future';
    baseUrl = 'https://futures.waterscarcityatlas.org';
    break;
  default:
    bucket = 'lucify-wasco';
    baseUrl = 'https://explore.waterscarcityatlas.org';
    break;
}

const opts = {
  bucket,
  baseUrl,
  publicPath: '/',
};

module.exports = lucifyDeployConfig(null, opts);
