const config = require("./config");
const app = require("./app.js");

console.log(`埠口：${config.PORT}`);
app.listen(config.PORT);