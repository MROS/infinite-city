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

module.exports = {
	PORT,
	test_server,
	dev_server
};
