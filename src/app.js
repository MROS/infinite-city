"use strict";

const express = require("express");
const morgan = require("morgan");
const path = require("path");
let bodyParser = require("body-parser");
let session = require("express-session");
const config = require("./config");

let app = express();

app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(session({
	secret: "recommand 128 bytes random string",
	cookie: { maxAge: 60 * 1000 },
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
app.use("/api/rule", require("./rule/router.js"));
app.use("/api/comment", require("./comment/router.js"));

console.log(`埠口：${config.PORT}`);
app.listen(config.PORT);
