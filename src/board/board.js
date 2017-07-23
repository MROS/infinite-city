const db = require("../database.js");

/**
 * @param {String} manager_id 
 * @param {String} name 
 * @param {String} mather_id 
 * @param {Object} rules 
 */
async function createBoard(manager_id, name, mather_id, rules) {
	let mather = await db.Board.findOne({ _id: mather_id }).exec();
	if(!mather) throw `${ mather_id } 看板不存在`;
	let new_board = { mather: mather_id };
	if(mather.allowDefineTitle) {
		new_board.renderTitle = rules.renderTitle;
	}
	if(mather.allowDefineContent) {
		new_board.renderContent = rules.renderContent;
	}
	if(mather.allowDefineForm) {
		new_board.renderCommentForm = rules.renderCommentForm;
	}
	if(mather.allowDefineComment) {
		new_board.renderComment = rules.renderComment;
	}
	new_board.allowDefineTitle = rules.allowDefineTitle && mather.allowDefineTitle;
	new_board.allowDefineContent = rules.allowDefineContent && mather.allowDefineContent;
	new_board.allowDefineForm = rules.allowDefineForm && mather.allowDefineForm;
	new_board.allowDefineComment = rules.allowDefineComment && mather.allowDefineComment;

	new_board.name = name;
	new_board.manager = [manager_id];
	await db.Board.create(new_board);
}

module.exports = {
	createBoard
};