const path = require('path');

module.exports = {
  mode: 'production',
  entry: path.join(__dirname, 'src', 'index.js'),
  devServer: {
    static: [
      {
        directory: path.resolve(__dirname, 'output'),
        serveIndex: true
      }, {
        directory: path.join(__dirname, '../test/configs/backstop_data/html_report'),
        publicPath: '/'
      }, {
        directory: path.join(__dirname, '../test/configs/backstop_data'),
        publicPath: '/'
      }
    ],
    client: {
      overlay: {
        errors: true,
        warnings: false,
        runtimeErrors: true
      }
    },
    webSocketServer: false
  },
  output: {
    path: path.resolve(__dirname, 'output'),
    filename: 'index_bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.(png|jpg|gif)$/i,
        type: 'asset/inline'
      }
    ]
  }
};
