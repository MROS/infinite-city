const db = require("../database.js");
const { findBackendRules, doRestricts } = require("../util.js");

/**
 * @param {String} author
 * @param {String} title 
 * @param {String} board_id
 * @param {Object} rules
 */
async function createArticle(author_id, title, board_id, articleContent,
	formRules, renderRules, backendRules) {

	let board = await db.Board.findOne({ _id: board_id }).exec();
	if(!board) throw `${ board_id } 看板不存在`;

	let new_article = { board: board_id };
	new_article.title = title;
	new_article.author = author_id;
	new_article.articleContent = articleContent;
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

	let restricts_str = findBackendRules({ b_id: board_id, rule_name: "onNewArticle" });
	let err_msg = doRestricts(new_article, author_id, restricts_str);
	if(err_msg) return err_msg;

	await db.Article.create(new_article);
	return null;
}

module.exports = {
	createArticle
};