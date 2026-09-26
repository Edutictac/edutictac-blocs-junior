const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const appDir = path.resolve(__dirname, 'src/app');

const pages = [
  { filename: 'index.html', template: path.join(appDir, 'index.html') },
  { filename: 'home.html', template: path.join(appDir, 'home.html') },
  { filename: 'editor.html', template: path.join(appDir, 'editor.html') },
  { filename: 'gettingstarted.html', template: path.join(appDir, 'gettingstarted.html') }
];

module.exports = (env, argv) => {
  const isProd = argv.mode === 'production';
  return {
    entry: { app: './src/junior-entry.js' },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'bundle.js',
      clean: true
    },
    optimization: {
      minimize: isProd,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: { drop_console: false },
            output: { comments: false }
          }
        })
      ]
    },
    plugins: [
      ...pages.map((p) => new HtmlWebpackPlugin({
        filename: p.filename,
        template: p.template,
        inject: 'body',
        scriptLoading: 'defer',
        minify: false
      })),
      new CopyWebpackPlugin({
        patterns: [
          { from: path.join(appDir, 'assets'), to: 'assets' },
          { from: path.join(appDir, 'css'), to: 'css' },
          { from: path.join(appDir, 'localizations'), to: 'localizations' },
          { from: path.join(appDir, 'pnglibrary'), to: 'pnglibrary' },
          { from: path.join(appDir, 'svglibrary'), to: 'svglibrary' },
          { from: path.join(appDir, 'sounds'), to: 'sounds' },
          { from: path.join(appDir, 'samples'), to: 'samples' },
          { from: path.join(appDir, 'inapp'), to: 'inapp' },
          { from: path.join(appDir, 'media.json'), to: 'media.json' },
          { from: path.join(appDir, 'settings.json'), to: 'settings.json' },
          { from: 'public', to: '.' },
          { from: 'node_modules/sql.js/dist/sql-wasm.wasm', to: 'sql-wasm.wasm' }
        ]
      })
    ],
    devServer: {
      static: { directory: path.resolve(__dirname, 'dist') },
      compress: true,
      port: 3002,
      hot: false
    },
    devtool: isProd ? false : 'eval-source-map'
  };
};
