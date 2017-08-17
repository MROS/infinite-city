"use strict";

const express = require("express");
const path = require("path");

let app = express();

const morgan = require("morgan");
app.use(morgan("dev"));

const bodyParser = require("body-parser");
app.use(bodyParser.json());

const session = require("express-session");
const RedisStore = require("connect-redis")(session);

app.use(session({
	store: new RedisStore({ host: "127.0.0.1", port: 6379 }),
	secret: "recommand 128 bytes random string",
	cookie: { maxAge: 15 * 24 * 60 * 60 * 1000 }, // 十五天
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