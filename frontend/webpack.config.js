const path = require("path");

module.exports = {
	entry: {
		index: "./src/index.jsx"
	},
	output: {
		path: path.resolve(__dirname, "static/build"),
		filename: "[name].js",
		publicPath: "/build/",
		chunkFilename: "[name].js"
	},
	optimization: {
		runtimeChunk: {
			name: "manifest"
		},
		splitChunks: {
			cacheGroups: {
				vendor: {
					test: /[\\/]node_modules[\\/]/,
					name: "vendors",
					priority: -20,
					chunks: "all"
				}
			}
		}
	},
	module: {
		rules: [
			{
				test: /\.jsx$/,
				use: {
					loader: "babel-loader",
					options: {
						presets: ["@babel/preset-react"],
					}
				}
			}
		]
	},
};
