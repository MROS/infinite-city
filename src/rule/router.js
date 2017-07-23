const db = require("../database.js");
let router = require("express").Router();

const RULES = [
	"renderTitle",
	"renderContent",
	"renderCommentForm",
	"renderComment"
];

async function findBoard(_id) {
	return await db.Board.find({_id}).exec();
}
function ruleDone(rules) {
	for(let key of RULES) {
		if(!rules[key]) return false;
	}
	return true;
}

router.get("/rule/article/:article", async function(req, res) {
	try {
		let article_id = req.params.article;
		let article = await db.Article.find({ _id: article_id }).exec();
		let board = await findBoard(article.board);

		let rules = {};
		for (let key of RULES) rules[key] = null;
		if (article.renderComment) {
			rules["renderComment"] = article.renderComment;
		}
		while (true) {
			for (let key in RULES) {
				if (!rules[key]) rules[key] = board[key];
			}
			if (ruleDone(rules)) break;
			else board = await findBoard(board.mather);
		}
		res.json(rules);
	} catch(err) {
		console.log(err);
		res.send("FAIL");
	}
});

module.exports = router;