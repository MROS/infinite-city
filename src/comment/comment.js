const _ = require("lodash");
const db = require("../database.js");
const { doRestricts, processContent } = require("../util/util.js");
const { findBackendRules } = require("../util/db_util.js");

async function createComment(author_id, article_id, commentContent) {
	let article = await db.Article.findOne({ _id: article_id }).exec();
	if (!article) {
		throw `${ article_id } 文章不存在`;
	}
	let article_data = _.last(article.data);

	processContent(commentContent, article_data.commentForm); // 檢查是否符合表格

	let new_comment = {
		article: article_id,
		author: author_id,
		commentContent: commentContent,
		date: new Date()
	};
	let restricts = await findBackendRules(article.board, ["onComment", "onEnter"], article_data);
	let err_msg = doRestricts({ comment: new_comment, article: article_data },
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
