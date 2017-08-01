const db = require("../database.js");
const { findBackendRules, findFrontendRules, doRestricts } = require("../util.js");

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

	let new_article = { board: board_id };
	new_article.title = title;
	new_article.author = author_id;
	new_article.articleContent = articleContent;
	new_article.date = new Date();
	// Form Rules
	if(board.canDefCommentForm) {
		new_article.commentForm = formRules.commentForm;
	}
	// Render Rules
	if(board.canDefComment) {
		new_article.renderComment = renderRules.renderComment;
	}
	// Backend Rules
	new_article.onComment = backendRules.onComment;

	let restricts = await findBackendRules(board_id, "onNewArticle");
	let err_msg = doRestricts({ article: new_article, board: board }, author_id, restricts);

	if(err_msg) {
		return { err_msg };
	}
	let new_id = (await db.Article.create(new_article))._id;
	return { _id: new_id };
}

async function getArticle(board_id, article_id, max, user_id) {
	let [restricts, article] = await Promise.all([
		findBackendRules(board_id, "onEnter"),
		db.Article.findOne({ _id: article_id, board: board_id }).lean().exec()
	]);
	if(!article) {
		throw "無此文章！";
	}
	for(let onEnter of article.onEnter) {
		restricts.push({ caller: article, func: onEnter });
	}
	// TODO: 不能只傳入 board id!!
	let err_msg = doRestricts({ board_id, article }, user_id, restricts);
	if(err_msg) {
		return { err_msg };
	}

	// TODO: 如果本來就有，根本不用找，應該省略這步來增進效能
	let [rules, comment] = await Promise.all([
		findFrontendRules(board_id, ["renderComment", "renderArticleContent", "commentForm"]),
		db.Comment.find({ article: article_id }).sort({ date: -1 }).limit(max).lean().exec()
	]);
	if(!article.renderComment) {
		article.renderComment = rules.renderComment;
	}
	if(!article.commentForm) {
		article.commentForm = rules.commentForm;
	}
	article.renderArticleContent = rules.renderArticleContent;
	article.comment = comment;
	return article;
}

module.exports = {
	createArticle, getArticle
};