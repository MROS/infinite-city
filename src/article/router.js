const db = require("../database.js");
let router = require("express").Router();
let { createArticle } = require("./article.js");

router.post("/new", async function(req, res) {
	let userId = req.session.userId;
	if(!userId) {
		res.send("尚未登入");
	}
	else {
		let query = req.body;
		createArticle(userId, query.title, query.board, query.rules);
		res.send("OK");
	}
});

module.exports = router;