const db = require("../database.js");

/**
 * @param {String} manager_id 
 * @param {String} name 
 * @param {String} parent_id 
 * @param {Object} rules 
 */
async function createBoard(manager_id, name, parent_id, articleForm, rules) {
	let parent = await db.Board.findOne({ _id: parent_id }).exec();
	if(!parent) throw `${ parent_id } 看板不存在`;
	let new_board = { parent: parent_id };
	if(parent.canDefTitle) {
		new_board.renderTitle = rules.renderTitle;
	}
	if(parent.canDefContent) {
		new_board.renderContent = rules.renderContent;
	}
	if(parent.canDefCommentForm) {
		new_board.renderCommentForm = rules.renderCommentForm;
	}
	if(parent.canDefComment) {
		new_board.renderComment = rules.renderComment;
	}
	if(parent.canDefArticleForm) {
		new_board.renderArticleForm = rules.renderArticleForm;
	}
	new_board.canDefTitle = rules.canDefTitle && parent.canDefTitle;
	new_board.canDefContent = rules.canDefContent && parent.canDefContent;
	new_board.canDefCommentForm = rules.canDefCommentForm && parent.canDefCommentForm;
	new_board.canDefComment = rules.canDefComment && parent.canDefComment;
	new_board.canDefArticleForm = rules.canDefArticleForm && parent.canDefArticleForm;

	new_board.name = name;
	new_board.manager = [manager_id];
	new_board.articleForm = articleForm;
	await db.Board.create(new_board);
}

module.exports = {
	createBoard
};