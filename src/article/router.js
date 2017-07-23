const db = require("../database.js");
let router = require("express").Router();
let { createArticle } = require("./article.js");

router.post("/new", async function (req, res) {
	try {
		let userId = req.session.userId;
		if (!userId) {
			res.send("尚未登入");
		}
		else {
			let query = req.body;
			await createArticle(userId, query.title, query.board,
				query.content, query.commentForm, query.rules);
			res.send("OK");
		}
	} catch (err) {
		console.log(err);
		res.send("FAIL");
	}
});

module.exports = router;