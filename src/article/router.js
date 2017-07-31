let router = require("express").Router();
let { createArticle, getArticle } = require("./article.js");
let { recursiveGetBoard, getRootId } = require("../util.js");

router.post("/new", async function (req, res) {
	try {
		let userId = req.session.userId;
		if (!userId) {
			res.send("尚未登入");
		} else {
			let query = req.body;
			let err_msg = await createArticle(userId, query.title,
				query.board, query.articleContent,
				query.formRules, query.renderRules, query.backendRules);
			if (err_msg) {
				res.send(err_msg);
			} else {
				res.send("OK");
			}
		}
	} catch (err) {
		console.log(err);
		res.status(400).send("FAIL");
	}
});

router.get("/browse", async function(req, res) {
	try {
		let max = req.query.max || 20;
		let name = [], article_id = req.query.id;
		if (req.query.name) {
			name = req.query.name.split(",");
		}
		let root_id = req.query.base;
		if (!root_id) {
			root_id = await getRootId();
		}
		let board_id = await recursiveGetBoard(root_id, name);
		let article = getArticle(board_id, article_id, max, req.session.userId);
		if(article.err_msg) {
			res.send(article.err_msg);
		}
		else {
			res.json(article);
		}
	} catch (err) {
		res.status(400).send("FAIL");
		console.log(err);
	}
});


module.exports = router;