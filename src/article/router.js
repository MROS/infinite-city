let router = require("express").Router();
let _ = require("lodash");
let { createArticle, getArticle } = require("./article.js");
let { recursiveGetBoard, getRootId } = require("../util/db_util.js");

router.post("/new", async function (req, res) {
	try {
		let user_id = req.session.user_id;
		if (!user_id) {
			res.status(401).send("尚未登入");
		} else {
			let query = req.body;
			let new_a = await createArticle(user_id, query.title,
				query.board, query.articleContent,
				query.formRules, query.renderRules, query.backendRules);
			if (new_a.err_msg) {
				res.status(403).send(new_a.err_msg);
			} else {
				res.json(new_a);
			}
		}
	} catch (err) {
		console.log(err);
		if(_.isString(err)) {
			res.status(400).send(err);
		} else {
			res.status(500).send("FAIL");
		}
	}
});

router.get("/browse", async function(req, res) {
	try {
		let max = req.query.max || 10000;
		let name = [], article_id = req.query.id;
		if (req.query.name) {
			name = req.query.name.split(",");
		}
		let root_id = req.query.base;
		if (!root_id) {
			root_id = await getRootId();
		}
		let board = await recursiveGetBoard(root_id, name);
		let article = await getArticle(board, article_id, max, req.session.user_id);
		if(article.err_msg) {
			res.status(400).send(article.err_msg);
		} else {
			res.json(article);
		}
	} catch (err) {
		console.log(err);
		if(_.isString(err)) {
			res.status(404).send(err);
		} else {
			res.status(500).send("FAIL");
		}
	}
});


module.exports = router;