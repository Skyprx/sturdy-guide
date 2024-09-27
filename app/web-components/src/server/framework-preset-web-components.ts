import { Configuration } from 'webpack';

export function webpack(config: Configuration) {
  return {
    ...config,
    module: {
      ...config.module,
      rules: [
        ...config.module.rules,
        {
          test: [
            new RegExp(`src(.*)\\.js$`),
            new RegExp(`packages(\\/|\\\\)*(\\/|\\\\)src(\\/|\\\\)(.*)\\.js$`),
            new RegExp(`node_modules(\\/|\\\\)lit-html(.*)\\.js$`),
            new RegExp(`node_modules(\\/|\\\\)lit-element(.*)\\.js$`),
            new RegExp(`node_modules(\\/|\\\\)@open-wc(.*)\\.js$`),
            new RegExp(`node_modules(\\/|\\\\)@polymer(.*)\\.js$`),
            new RegExp(`node_modules(\\/|\\\\)@vaadin(.*)\\.js$`),
          ],
          use: {
            loader: 'babel-loader',
            options: {
              plugins: [
                [
                  '@babel/plugin-transform-runtime',
                  {
                    absoluteRuntime: false,
                    corejs: false,
                    helpers: true,
                    regenerator: true,
                    useESModules: false,
                  },
                ],

                '@babel/plugin-syntax-dynamic-import',
                '@babel/plugin-syntax-import-meta',
                // webpack does not support import.meta.url yet, so we rewrite them in babel
                ['bundled-import-meta', { importStyle: 'baseURI' }],
              ],
              babelrc: false,
            },
          },
        },
      ],
    },
  };
}
