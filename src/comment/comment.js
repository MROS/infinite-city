const db = require("../database.js");

async function createComment(author_id, article_id, msg) {
	let article = await db.Board.findOne({ _id: article }).exec();
	if(!article) throw `${ article } 看板不存在`;
	let new_comment = {
		article: article_id,
		author: author_id,
		msg: msg,
	};
	for(let on_comment of article.onComment) {
		let restrictFunc = eval("(" + on_comment.rule + ")");
		restrictFunc(new_comment);
	}
	db.Comment.create(new_comment);
}

module.exports = {
	createComment
};