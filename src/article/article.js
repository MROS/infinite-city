const db = require("../database.js");

// TODO:
async function getPostRestrict() {

}

/**
 * @param {String} arthur
 * @param {String} title 
 * @param {String} board_id
 * @param {Object} rules
 */
async function createArticle(arthur, title, board_id, content, form, rules) {
	let board = await db.Board.findOne({ _id: board_id }).exec();
	if(!board) throw `${ board_id } 看板不存在`;

	let new_article = { board: board_id };
	if(board.canDefContent) {
		new_article.renderContent = rules.renderContent;
	}
	new_article.arthur = arthur;
	new_article.title = title;
	new_article.content = content;
	new_article.commentForm = form;

	if(board.onArticle) {
		let restrictFunc = eval("(" + board.onArticle + ")");
		restrictFunc(new_article); // 可能會丟出錯誤
	}

	await db.Article.create(new_article);
}

module.exports = {
	createArticle
};