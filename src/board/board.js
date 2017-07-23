const ObjectId = require("mongoose").Schema.Types.ObjectId;
const db = require("../database.js");

async function createBoard(manager_id, name, mather_id, rules) {
	let mather = await db.Board.find({ id: ObjectId(mather_id) });
	if(!mather) throw `${mather_id} 看板不存在`;
	let new_board = {};
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
	new_board.allowDefineTitle = true && mather.allowDefineTitle;
	new_board.allowDefineContent = true && mather.allowDefineContent;
	new_board.allowDefineForm = true && mather.allowDefineForm;
	new_board.allowDefineComment = true && mather.allowDefineComment;

	new_board.name = name;
	new_board.manager = [manager_id];
	await db.createBoard(new_board);
}

export {
	createBoard
};