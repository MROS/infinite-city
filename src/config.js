const PORT = 8080;
const dev_server = {
	url: "mongodb://127.0.0.1/INF-DEV",
	options: {
		useMongoClient: true,
		reconnectTries: Number.MAX_VALUE,
	}
};
const test_server = {
	url: "mongodb://127.0.0.1/INF-TEST",
	options: {
		useMongoClient: true,
		reconnectTries: Number.MAX_VALUE,
	}
};

let env = require("optimist").argv.env || process.env.env || "dev";
console.log(`環境：${env}`);
let server = (() => {
	switch (env) {
		case "dev":
			return dev_server;
		case "test":
			return test_server;
		default:
			throw `未知的環境：${env}`;
	}
})();

module.exports = {
	PORT,
	server,
};
