"use strict";

const express = require("express");
const morgan = require("morgan");
let bodyParser = require("body-parser");
let session = require("express-session");
const config = require("./config");

let app = express();

app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(express.static("frontend/static"));
app.use(session({
	secret: "recommand 128 bytes random string",
	cookie: { maxAge: 60 * 1000 },
	resave: true,
	saveUninitialized: true
}));

app.use("/api/board", require("./board/router.js"));
app.use("/api/user", require("./user/router.js"));
app.use("/api/rule", require("./rule/router.js"));

console.log(`埠口：${config.PORT}`);
app.listen(config.PORT);
