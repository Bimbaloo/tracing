'use strict'

const { join, resolve } = require('path')
const webpack = require('webpack')
const glob = require('glob')

const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const extractCSS = new ExtractTextPlugin({
  filename: 'assets/css/[name].css',
  allChunks: true
})
const extractLESS = new ExtractTextPlugin({
  filename: 'assets/css/[name].css',
  allChunks: true
})
const entries = {}
const chunks = []
glob.sync('./src/pages/**/app.js').forEach(path => {
  const chunk = path.split('./src/pages/')[1].split('/app.js')[0]
  entries[chunk] = path
  entries[chunk] = ['babel-polyfill', path]
  chunks.push(chunk)
})

const config = {
  entry: entries,
  output: {
    path: resolve(__dirname, './dist'),
    filename: 'assets/js/[name].js'
//  publicPath: '/'
  },
  resolve: {
    extensions: ['.js', '.vue'],
    alias: {
      assets: join(__dirname, '/src/assets'),
      components: join(__dirname, '/src/components'),
      root: join(__dirname, 'node_modules'),
      vue: 'vue/dist/vue.js',
      theme: join(__dirname, '/src/assets/theme')
    }
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            css: ['css-hot-loader'].concat(ExtractTextPlugin.extract({
              use: 'css-loader',
              fallback: 'style-loader'
            })),
            less: ['css-hot-loader'].concat(ExtractTextPlugin.extract({
              use: ['css-loader', 'postcss-loader', 'less-loader'],
              fallback: 'style-loader'
            })),
            postcss: ['css-hot-loader'].concat(ExtractTextPlugin.extract({
              use: ['css-loader', 'postcss-loader'],
              fallback: 'style-loader'
            }))
          }
        }
      },
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['css-hot-loader'].concat(ExtractTextPlugin.extract({
          use: ['css-loader', 'postcss-loader'],
          fallback: 'style-loader'
        }))
      },
      {
        test: /\.less$/,
        use: ['css-hot-loader'].concat(ExtractTextPlugin.extract({
          use: ['css-loader', 'postcss-loader', 'less-loader'],
          fallback: 'style-loader'
        }))
      },
      {
        test: /\.html$/,
        use: [{
          loader: 'html-loader',
          options: {
            root: resolve(__dirname, 'src'),
            attrs: ['img:src', 'link:href']
          }
        }]
      },
      {
        test: /\.(png|jpg|jpeg|gif|eot|ttf|woff|woff2|svg|svgz)(\?.+)?$/,
        exclude: /favicon\.png$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 1000000,
            name: 'assets/img/[name].[hash:7].[ext]'
          }
        }]
      }
    ]
  },
  plugins: [
    // new webpack.DefinePlugin({
    //   'DEV_HOST': JSON.stringify("http://192.168.227.172:8088"), //http://192.168.20.187:8080
    //   'PRO_HOST': JSON.stringify("http://192.168.227.170:8087")
    // }),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new CommonsChunkPlugin({
      name: 'vendors',
      filename: 'assets/js/vendors.js',
      chunks: chunks,
      minChunks: chunks.length
    }),
    extractLESS,
    extractCSS,
    new CopyWebpackPlugin([
      {
        from: 'src/static',
        to: 'static'/*,
          ignore: ['.*'] */
      }
    ])
  ],
  devServer: {
    host: '0.0.0.0', // 0.0.0.0 为了使项目可以ip访问  https://doc.webpack-china.org/configuration/dev-server/#devserver-host
    // host: '127.0.0.1',
    port: 8010,
    // historyApiFallback: false,
    historyApiFallback: {
      rewrites: [
        { from: /^\/$/, to: '/search.html' }
      ]
    },
    noInfo: true,
    // proxy: {
    //   '/api': {
    //     target: 'http://127.0.0.1:8010', // 后端服务地址。
    //     changeOrigin: true,
    //     pathRewrite: { '^/api': '' }
    //   }
    // },
    useLocalIp: true, // host修改后，会自动打开0.0.0.0:8010/search.html，这个属性使用本地ip作为页面ip https://doc.webpack-china.org/configuration/dev-server/#devserver-uselocalip
    open: true,
    openPage: 'search.html', // 希望自动打开 http://127.0.0.1:8010/search.html
    compress: true // 开启gzip压缩
  },
  devtool: '#eval-source-map'
}

glob.sync('./src/pages/**/*.html').forEach(path => {
  const chunk = path.split('./src/pages/')[1].split('/app.html')[0]
  const filename = chunk + '.html'
  const htmlConf = {
    filename: filename,
    template: path,
    inject: 'body',
    favicon: './src/assets/img/logo.png',
    hash: process.env.NODE_ENV === 'production',
    chunks: ['vendors', chunk]
  }
  config.plugins.push(new HtmlWebpackPlugin(htmlConf))
})

module.exports = config

if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = '#source-map'
  // http://vue-loader.vuejs.org/en/workflow/production.html
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      sourceMap: true
    }),
    new OptimizeCSSPlugin()
  ])
}
