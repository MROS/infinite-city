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
			let err_msg = await createArticle(userId, query.title,
				query.board, query.articleContent,
				query.formRules, query.renderRules, query.backendRules);
			if(err_msg) res.send(err_msg);
			else res.send("OK");
		}
	} catch (err) {
		console.log(err);
		res.status(400).send("FAIL");
	}
});

module.exports = router;