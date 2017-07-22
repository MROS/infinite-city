const path = require("path");

module.exports = {
  entry: "./src/index.jsx",
  output: {
	  path: path.resolve(__dirname, "static/js"),
      filename: "bundle.js"
    },
	module: {
		rules: [
			{
				test: /\.jsx$/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['babel-preset-react'],
					}
				}
			}
		]
	}
}
