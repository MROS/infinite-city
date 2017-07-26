const db = require("../database.js");
let router = require("express").Router();

const RULES = [
	"renderTitle",
	"renderArticleContent",
	"renderCommentForm",
	"renderComment",
	"renderArticleForm"
];

async function findBoard(_id) {
	return await db.Board.findOne({_id}).exec();
}
function ruleDone(rules) {
	for(let key of RULES) {
		if(!rules[key]) return false;
	}
	return true;
}

async function findRule(board, rules) {
	while (true) {
		for (let key of RULES) {
			if (!rules[key]) rules[key] = board[key];
		}
		if (ruleDone(rules) || board.isRoot) break;
		else board = await findBoard(board.parent);
	}
}

router.get("/article/:article", async function(req, res) {
	try {
		let article_id = req.params.article;
		let article = await db.Article.findOne({ _id: article_id }).lean().exec();
		let board = await findBoard(article.board);
		let rules = {};
		rules["renderComment"] = article.renderComment;

		await findRule(board, rules);
		res.json(rules);
	} catch(err) {
		console.log(err);
		res.send("FAIL");
	}
});

router.get("/board/:board", async function(req, res) {
	try {
		let board_id = req.params.board;
		let board = await db.Board.findOne({ _id: board_id }).lean().exec();
		let rules = {};

		await findRule(board, rules);
		res.json(rules);
	} catch(err) {
		console.log(err);
		res.send("FAIL");
	}
});

module.exports = router;