const packageJson = require('../../package.json');

export default {
  packageJson,
  frameworkPresets: [require.resolve('./framework-preset-preact.js')],
};
