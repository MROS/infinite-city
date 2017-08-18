"use strict";

const express = require("express");
const path = require("path");
const config = require("./config.js");

let app = express();

const morgan = require("morgan");
app.use(morgan("dev"));

const bodyParser = require("body-parser");
app.use(bodyParser.json());

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