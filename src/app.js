"use strict";

const express = require("express");
const path = require("path");
const config = require("./config.js");

let app = express();

// 在開發環境使用 compression 套件來壓縮。生產環境則在 反向代理時進行壓縮，因此無需該套件。
if (config.env == "dev") {
	const compression = require("compression");
	app.use(compression());
}

// log
const morgan = require("morgan");
app.use(morgan("dev"));

// 解析 body
const bodyParser = require("body-parser");
app.use(bodyParser.json());

// 以 redis 做 cookie 快取
const session = require("express-session");
const RedisStore = require("connect-redis")(session);

app.use(session({
	store: new RedisStore(config.REDIS_STORE_OPTION),
	secret: config.SESSION_SECRECT_KEY,
	cookie: { maxAge: config.COOKIE_MAX_AGE }, // 十五天
	resave: true,
	saveUninitialized: true
}));

app.get("/", function (req, res) {
	res.redirect("/app");
});

app.use(express.static("frontend/static"));

// NOTE: 首頁一樣會因爲 express.static 而回傳 index.html
app.get(/\/(app\/.*|app)/, function (req, res) {
	res.sendFile(path.resolve("frontend/static/index.html"));
});

app.use("/api/user", require("./user/router.js"));
app.use("/api/board", require("./board/router.js"));
app.use("/api/article", require("./article/router.js"));
app.use("/api/comment", require("./comment/router.js"));

module.exports = app;