const db = require("../database.js");
const { findBackendRules, doRestricts } = require("../util.js");

async function createComment(author_id, article_id, msg) {
	let article = await db.Article.findOne({ _id: article_id }).exec();
	if (!article) {
		throw `${ article } 看板不存在`;
	}

	let new_comment = {
		article: article_id,
		author: author_id,
		msg: msg,
		date: new Date()
	};
	let restricts = await findBackendRules(article.board, "onComment" );
	for(let onComment of article.onComment) {
		restricts.push({ caller: article, func: onComment });
	}
	let err_msg = doRestricts({ comment: new_comment, article: article }, author_id, restricts);
	if (err_msg) {
		return err_msg;
	}

	await db.Comment.create(new_comment);
}

module.exports = {
	createComment
};