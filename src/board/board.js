const db = require("../database.js");

// TODO:
async function getNewBoardRestrict() {
}

/**
 * @param {Board} board 
 * @param {Board} parent 
 * @param {Object} rules
 * @param {String} can_key 
 * @param {String} rule_key
 */
function setRule(board, parent, rules, can_key, rule_key) {
	if(parent[can_key]) board[rule_key] = rules[rule_key];
	board[can_key] = rules[can_key] && parent[can_key];
}

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

	setRule(new_board, parent, rules, "canDefTitle", "renderTitle");
	setRule(new_board, parent, rules, "canDefCommentForm", "renderCommentForm");
	setRule(new_board, parent, rules, "canDefContent", "renderContent");
	setRule(new_board, parent, rules, "canDefArticleForm", "renderArticleForm");
	setRule(new_board, parent, rules, "canDefTitle", "renderTitle");

	setRule(new_board, parent, rules, "canRestrictBoard", "onNewBoard");
	setRule(new_board, parent, rules, "canRestrictPost", "onPost");
	setRule(new_board, parent, rules, "canRestrictComment", "onComment");

	new_board.name = name;
	new_board.manager = [manager_id];
	new_board.articleForm = articleForm;

	if(parent.onNewBoard) {
		let restrictFunc = eval("(" + parent.onNewBoard + ")");
		restrictFunc(new_board);
	}

	await db.Board.create(new_board);
}

async function getRootId() {
	return (await db.Board.findOne({ isRoot: true }, { _id: 1 }).lean().exec())._id;
}

async function recursiveGetBoard(id, name, depth=0) {
	if(depth == name.length) return id;
	let next_b = await (db.Board.findOne({ name: name[depth], parent: id }).lean().exec());
	if(!next_b) throw `找不到看板 ${name[depth]}`;
	return await recursiveGetBoard(next_b._id, name, depth+1);
}

module.exports = {
	createBoard, getRootId, recursiveGetBoard
};