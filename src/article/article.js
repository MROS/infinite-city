const db = require("../database.js");
const { doRestricts, setRule, processContent, deleteIDs } = require("../util/util.js");
const { findBackendRules } = require("../util/db_util.js");
/**
 * @param {String} author
 * @param {String} title 
 * @param {String} board_id
 * @param {Object} rules
 */
async function createArticle(author_id, title, board_id, articleContent,
	formRules, renderRules, backendRules) {

	let board = await db.Board.findOne({ _id: board_id }).exec();
	if(!board) {
		throw `${ board_id } 看板不存在`;
	}

	processContent(articleContent, board.articleForm); // 檢查是否符合表格

	let new_article = { board: board_id };
	new_article.title = title;
	new_article.author = author_id;
	new_article.articleContent = articleContent;
	new_article.date = new Date();
	// Form Rules
	setRule(new_article, formRules, "commentForm");
	// Render Rules
	setRule(new_article, renderRules, "renderComment");
	// Backend Rules
	setRule(new_article, backendRules, "onComment");

	let restricts = await findBackendRules(board, "onNewArticle");
	let err_msg = doRestricts({ article: new_article, board: board }, author_id, restricts);

	if(err_msg) {
		return { err_msg };
	}
	let new_id = (await db.Article.create(new_article))._id;
	return { _id: new_id };
}

async function getArticle(board, article_id, max, user_id) {
	let article = await db.Article.findOne({ _id: article_id, board: board._id }).lean().exec();
	if(!article) {
		throw `無此文章 ${article_id}`;
	}

	let backend_rules = await findBackendRules(board, ["onEnter", "onComment"], article);
	let err_msg = doRestricts({ board, article }, user_id, backend_rules["onEnter"]);
	if(err_msg) {
		return { err_msg };
	}

	let commentPromise = db.Comment.find({ article: article_id })
	.sort({ date: 1 }).limit(max).lean().exec();

	article.renderArticleContent = board.renderArticleContent;

	let authority = {};
	err_msg = doRestricts({ board, article }, user_id, backend_rules["onComment"]);
	if(user_id) {
		authority["onComment"] = { ok: err_msg ? false : true, msg: err_msg };
	} else {
		authority["onComment"] = { ok: false, msg: "尚未登入" };
	}
	article["authority"] = authority;

	article.comment = await commentPromise;

	deleteIDs(article.commentForm);
	return article;
}

module.exports = {
	createArticle, getArticle
};