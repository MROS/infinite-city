const db = require("../database.js");
const { findBackendRules, findFrontendRules, doRestricts, setRule, processContent } = require("../util.js");

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

	// TODO: 是否能和 findBackendRUles 一起做？
	let form = await findFrontendRules(board_id, "articleForm");
	processContent(articleContent, form);

	let new_article = { board: board_id };
	new_article.title = title;
	new_article.author = author_id;
	new_article.articleContent = articleContent;
	new_article.date = new Date();
	// Form Rules
	setRule(new_article, formRules, "commentForm", board, "canDefCommentForm");
	// Render Rules
	setRule(new_article, renderRules, "renderComment", board, "canDefComment");
	// Backend Rules
	setRule(new_article, renderRules, "onComment");

	let restricts = await findBackendRules(board_id, "onNewArticle");
	let err_msg = doRestricts({ article: new_article, board: board }, author_id, restricts);

	if(err_msg) {
		return { err_msg };
	}
	let new_id = (await db.Article.create(new_article))._id;
	return { _id: new_id };
}

async function getArticle(board_id, article_id, max, user_id) {
	let [backend_rules, article, board] = await Promise.all([
		findBackendRules(board_id, ["onEnter", "onComment"]),
		db.Article.findOne({ _id: article_id, board: board_id }).lean().exec(),
		db.Board.findOne({ _id: board_id }).lean().exec()
	]);
	if(!article) {
		throw "無此文章！";
	}
	for(let onEnter of article.onEnter) {
		backend_rules["onEnter"].push({ caller: article, func: onEnter });
	}
	for(let onComment of article.onComment) {
		backend_rules["onComment"].push({ caller: article, func: onComment });
	}
	let err_msg = doRestricts({ board, article }, user_id, backend_rules["onEnter"]);
	if(err_msg) {
		return { err_msg };
	}

	// TODO: 如果本來就有，根本不用找，應該省略這步來增進效能
	let [frontend_rules, comment] = await Promise.all([
		findFrontendRules(board_id, ["renderComment", "renderArticleContent", "commentForm"]),
		db.Comment.find({ article: article_id }).sort({ date: 1 }).limit(max).lean().exec()
	]);
	if(!article.renderComment) {
		article.renderComment = frontend_rules.renderComment;
	}
	// TODO: 用長度=0來判斷是不是不太對？
	if(!article.commentForm || article.commentForm.length == 0) {
		article.commentForm = frontend_rules.commentForm;
	}
	article.renderArticleContent = frontend_rules.renderArticleContent;
	article.comment = comment;

	let forbidden = {};
	err_msg = doRestricts({ board, article }, user_id, backend_rules["onComment"]);
	if(err_msg) {
		forbidden["onComment"] = err_msg;
	}
	article["forbidden"] = forbidden;

	return article;
}

module.exports = {
	createArticle, getArticle
};