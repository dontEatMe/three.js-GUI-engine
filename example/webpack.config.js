const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
module.exports = {
	entry: './index.js',
	plugins: [
		new CopyWebpackPlugin({
			patterns: [
				{ from: 'files/bomb.png' },
				{
					from: 'files/index.html',
					transform(content, absoluteFrom) {
						return Buffer.from(content.toString('utf8').replaceAll('\t','').replaceAll('\r\n',''));
					}
				}
			],
		})
	],
	optimization: {
		minimizer: [
			new TerserWebpackPlugin({
				extractComments: false
			})
		]
	}
}