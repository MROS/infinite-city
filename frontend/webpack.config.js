const webpack = require("webpack");
const path = require("path");
const BabiliPlugin = require("babili-webpack-plugin");

module.exports = {
	entry: "./src/index.jsx",
	output: {
		path: path.resolve(__dirname, "static/build"),
		filename: "bundle.js"
	},
	module: {
		rules: [
			{
				test: /\.jsx$/,
				use: {
					loader: "babel-loader",
					options: {
						presets: ["babel-preset-react"],
					}
				}
			}
		]
	},
	plugins: (() => {
		let ret = [
		];
		if (process.env.NODE_ENV == "production") {
			ret.push(new BabiliPlugin());
			ret.push(new webpack.DefinePlugin({
				"process.env.NODE_ENV": `"${process.env.NODE_ENV || "development"}"`,
			}));
		}
		return ret;
	})()
};
