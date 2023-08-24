const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
module.exports = {
  entry: './index.js',
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'files/bomb.png' },
        { from: 'files/index.html' },
      ],
    }),
  ],
  optimization: {
    minimizer: [new TerserWebpackPlugin({
      extractComments: false,
    })],
  },
};