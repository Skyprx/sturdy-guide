import fs from 'fs';
import * as common from './preset';

const makePreset = (framework: string) => {
  const frameworkConfig = `${__dirname}/../../../${framework}/config.js`;
  const preConfig = fs.existsSync(frameworkConfig) ? [frameworkConfig] : [];
  function config(entry: any[] = []) {
    return [...preConfig, ...entry];
  }

  const sourceLoaderOptions = framework === 'svelte' ? null : {};
  const configureJSX = framework !== 'react';
  const webpack = (webpackConfig: any, options: any) =>
    common.webpack(webpackConfig, { configureJSX, sourceLoaderOptions, ...options });

  return {
    ...common,
    webpack,
    config,
  };
};

export default makePreset;
