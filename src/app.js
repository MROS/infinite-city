"use strict";

const express = require("express");
const morgan = require("morgan");
const config = require("./config");
let app = express();

app.use(morgan("dev"));
app.use(express.static("frontend/static"));

console.log(`埠口：${config.PORT}`);
app.listen(config.PORT);
