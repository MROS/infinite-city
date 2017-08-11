const _ = require("lodash");
const db = require("../database.js");
const { doRestricts, findBackendRules, processContent } = require("../util.js");

async function createComment(author_id, article_id, commentContent) {
	let article = await db.Article.findOne({ _id: article_id }).exec();
	if (!article) {
		throw `${ article_id } 文章不存在`;
	}

	processContent(commentContent, article.commentForm); // 檢查是否符合表格

	let new_comment = {
		article: article_id,
		author: author_id,
		commentContent: commentContent,
		date: new Date()
	};
	let restricts = await findBackendRules(article.board, ["onComment", "onEnter"] );
	for(let onComment of article.onComment) {
		restricts["onComment"].push({ caller: article, func: onComment });
	}
	for(let onEnter of article.onEnter) {
		restricts["onEnter"].push({ caller: article, func: onEnter });
	}
	let err_msg = doRestricts({ comment: new_comment, article: article },
		author_id, restricts["onComment"] + restricts["onEnter"]);
	if (err_msg) {
		return { err_msg };
	}

	let new_id = (await db.Comment.create(new_comment))._id;
	return { _id: new_id };
}

module.exports = {
	createComment
};