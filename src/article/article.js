const db = require("../database.js");

/**
 * @param {String} author
 * @param {String} title 
 * @param {String} board_id
 * @param {Object} rules
 */
async function createArticle(author, title, board_id, content, form, rules) {
	let board = await db.Board.findOne({ _id: board_id }).exec();
	if(!board) throw `${ board_id } 看板不存在`;

	let new_article = { board: board_id };

	if(board.canDefArticleContent) {
		new_article.renderArticleContent = rules.renderArticleContent;
	}

	// TODO: 這種做法，如果上層改了限制，下層不會被繼承，應該修改！
	new_article.onComment = rules.onComment;
	for(let on_comment of board.onComment) {
		if(on_comment.mustObey) this.onComment.push(on_comment);
	}

	new_article.author = author;
	new_article.title = title;
	new_article.content = content;
	new_article.commentForm = form;


	for(let on_post of board.onPost) {
		let restrictFunc = eval("(" + on_post.rule + ")");
		restrictFunc(new_article); // 可能會丟出錯誤
	}

	await db.Article.create(new_article);
}

module.exports = {
	createArticle
};