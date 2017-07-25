const db = require("../database.js");

// TODO:
async function getCommentRestrict() {

}

async function createComment(arthur_id, article_id, msg) {
	let article = await db.Board.findOne({ _id: article }).exec();
	if(!article) throw `${ article } 看板不存在`;
	let new_comment = {
		article: article_id,
		arthur: arthur_id,
		msg: msg,
	};
	if(article.onComment) {
		let restrictFunc = eval("(" + article.onComment + ")");
		restrictFunc(new_comment);
	}
	db.Comment.create(new_comment);
}

module.exports = {
	createComment
};