const db = require("../database.js");

/**
 * @param {String} manager_id 
 * @param {String} name 
 * @param {String} parent_id 
 * @param {Object} rules 
 */
async function createBoard(manager_id, name, parent_id, rules) {
	let parent = await db.Board.findOne({ _id: parent_id }).exec();
	if(!parent) throw `${ parent_id } 看板不存在`;
	let new_board = { parent: parent_id };
	if(parent.allowDefineTitle) {
		new_board.renderTitle = rules.renderTitle;
	}
	if(parent.allowDefineContent) {
		new_board.renderContent = rules.renderContent;
	}
	if(parent.allowDefineForm) {
		new_board.renderCommentForm = rules.renderCommentForm;
	}
	if(parent.allowDefineComment) {
		new_board.renderComment = rules.renderComment;
	}
	new_board.allowDefineTitle = rules.allowDefineTitle && parent.allowDefineTitle;
	new_board.allowDefineContent = rules.allowDefineContent && parent.allowDefineContent;
	new_board.allowDefineForm = rules.allowDefineForm && parent.allowDefineForm;
	new_board.allowDefineComment = rules.allowDefineComment && parent.allowDefineComment;

	new_board.name = name;
	new_board.manager = [manager_id];
	await db.Board.create(new_board);
}

module.exports = {
	createBoard
};