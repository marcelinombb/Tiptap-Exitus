/* eslint-disable @typescript-eslint/no-var-requires */
const CopyWebpackPlugin = require('copy-webpack-plugin')
const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production'
  return {
    entry: path.resolve(__dirname, 'src/main.ts'),
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'exituseditor.js',
      library: 'ExitusEditor',
      assetModuleFilename: 'assets/[name][ext]',
      libraryTarget: 'umd',
      libraryExport: 'default',
      clean: true
    },
    devServer: {
      static: {
        directory: path.join(__dirname, 'src/public')
      },
      port: 9000
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.svg', '.js'],
      alias: {
        '@icons': path.resolve(__dirname, 'src/assets/icons/Editor'),
        '@editor': path.resolve(__dirname, 'src/editor'),
        '@src': path.resolve(__dirname, 'src'),
        '@extensions': path.resolve(__dirname, 'src/extensions')
      }
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx)?$/,
          loader: 'ts-loader',
          exclude: /node_modules/
        },
        {
          test: /\.svg$/,
          use: ['raw-loader']
        },
        /* {
          test: /\.(wasm)$/,
          type: 'asset/inline'
        }, */
        {
          test: /\.css$/,
          use: [
            {
              loader: 'style-loader',
              options: {
                injectType: 'singletonStyleTag',
                attributes: {
                  'data-exitus': true
                }
              }
            },
            {
              loader: 'css-loader'
            }
          ]
        }
      ]
    },
    plugins: [
      // other plugins...
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, 'src/public'),
            to: path.resolve(__dirname, 'dist')
          }
        ]
      })
    ],
    /* optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: true,
              drop_debugger: true
            }
          }
        })
      ]
    }, */
    devtool: 'source-map'
  }
}
