const db = require("../database.js");

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
// TODO: 這種做法，如果上層改了限制，下層不會被繼承，應該修改！
function setRestrict(board, parent, rules, key) {
	board[key] = rules[key] || [];
	for(let restrict of parent[key]) {
		if(restrict.mustObey) {
			board[key].push(board);
		}
	}
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

	setRestrict(new_board, parent, rules, "onNewBoard");
	setRestrict(new_board, parent, rules, "onEnterBoard");
	setRestrict(new_board, parent, rules, "onPost");
	setRestrict(new_board, parent, rules, "onComment");

	new_board.name = name;
	new_board.manager = [manager_id];
	new_board.articleForm = articleForm;

	for(let on_new_board of parent.onNewBoard) {
		let restrictFunc = eval("(" + on_new_board.rule + ")");
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