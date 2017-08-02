const db = require("../database.js");
const { findBackendRules, doRestricts, findFrontendRules, processContent } = require("../util.js");

async function createComment(author_id, article_id, commentContent) {
	let article = await db.Article.findOne({ _id: article_id }).exec();
	if (!article) {
		throw `${ article } 看板不存在`;
	}

	let form = article.commentForm || await findFrontendRules(article.board, "commentForm");
	processContent(commentContent, form);

	let new_comment = {
		article: article_id,
		author: author_id,
		commentContent: commentContent,
		date: new Date()
	};
	let restricts = await findBackendRules(article.board, "onComment" );
	for(let onComment of article.onComment) {
		restricts.push({ caller: article, func: onComment });
	}
	let err_msg = doRestricts({ comment: new_comment, article: article }, author_id, restricts);
	if (err_msg) {
		return { err_msg };
	}

	let new_id = (await db.Comment.create(new_comment))._id;
	return { _id: new_id };
}

module.exports = {
	createComment
};