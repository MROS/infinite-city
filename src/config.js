const env = require("optimist").argv.env || process.env.env || "dev";

const PORT = 8080;

// session 金鑰
const SESSION_SECRECT_KEY = "請修改本金鑰";

// cookie 保存時間
const COOKIE_MAX_AGE = 15 * 24 * 60 * 60 * 1000; // 十五天

// Redis 位址設定
const REDIS_STORE_OPTION = {
	host: "127.0.0.1",
	port: 6379,
	logErrors: true,
};

const normalOptions = {
	useMongoClient: true,
	reconnectTries: Number.MAX_VALUE,
};
const dev_server = {
	url: "mongodb://127.0.0.1/INF-DEV",
	options: normalOptions
};
const production_server = {
	url: "mongodb://127.0.0.1/INF",
	options: normalOptions
};
const test_server = {
	url: "mongodb://127.0.0.1/INF-TEST",
	options: normalOptions
};

module.exports = {
	env,
	PORT,
	SESSION_SECRECT_KEY,
	COOKIE_MAX_AGE,
	REDIS_STORE_OPTION,
	dev_server,
	production_server,
	test_server,
};
