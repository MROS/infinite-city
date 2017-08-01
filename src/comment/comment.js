const db = require("../database.js");
const { findBackendRules, doRestricts } = require("../util.js");

async function createComment(author_id, article_id, msg) {
	let article = await db.Board.findOne({ _id: article }).exec();
	if (!article) {
		throw `${ article } 看板不存在`;
	}

	let new_comment = {
		article: article_id,
		author: author_id,
		msg: msg,
		date: new Date()
	};
	let restricts_str = await findBackendRules(article.board, "onComment" );
	restricts_str.push({ caller: article, func: article.onComment });
	let err_msg = doRestricts(new_comment, author_id, restricts_str);
	if (err_msg) {
		return err_msg;
	}

	await db.Comment.create(new_comment);
}

module.exports = {
	createComment
};