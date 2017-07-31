const db = require("../database.js");
const { findBackendRules, doRestricts } = require("../util.js");

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
async function createBoard(manager_id, name, parent_id,
	formRules, renderRules, backendRules) {

	let parent = await db.Board.findOne({ _id: parent_id }).exec();
	if(!parent) throw `${ parent_id } 看板不存在`;

	let new_board = { parent: parent_id };
	new_board.name = name;
	new_board.manager = [manager_id];
	new_board.depth = parent.depth + 1;
	// Form Rules
	setRule(new_board, parent, formRules, "canDefArticleForm", "articleForm");
	setRule(new_board, parent, formRules, "canDefCommentForm", "commentForm");
	// Render Rules
	setRule(new_board, parent, renderRules, "canDefTitle", "renderTitle");
	setRule(new_board, parent, renderRules, "canDefArticleContent", "renderArticleContent");
	setRule(new_board, parent, renderRules, "canDefTitle", "renderTitle");
	// backend Rules
	new_board.onEnterBoard = backendRules.onEnterBoard;
	new_board.onNewBoard = backendRules.onNewBoard;
	new_board.onEnterArticle = backendRules.onEnterArticle;
	new_board.onNewArticle = backendRules.onNewArticle;
	new_board.onComment = backendRules.onComment;

	let restricts_str = findBackendRules({ b_id: parent_id, rule_name: "onNewBoard" });
	let err_msg = doRestricts(new_board, manager_id, restricts_str);
	if(err_msg) return err_msg;

	await db.Board.create(new_board);
	return null;
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

const ARTICLE_DISPLAY = {
	title: 1,
	date: 1,
	author: 1,
	articleContent: 1,
};
const BOARD_DISPLAY = {
	name: 1,
	manager: 1,
	date: 1,
	renderTitle: 1, // TODO:
	articleForm: 1, // TODO: 這兩個在 b_list 中其實不用傳，可以拿掉增進效能
};
async function getList(board_id, max, user_id) {
	let restricts_str = findBackendRules({ b_id: board_id, rule_name: "onEnterBoard" });
	let err_msg = doRestricts(board_id, user_id, restricts_str);
	// TODO: 不能只傳入 board_id，否則難以達到水桶之類的功能！！
	if(err_msg) return { err_msg };
	let [ b_list, a_list, board ] = await Promise.all([
		db.Board.find({ parent: board_id }, BOARD_DISPLAY).sort({ date: -1 }).limit(max).lean().exec(),
		db.Article.find({ board: board_id }, ARTICLE_DISPLAY).sort({ date: -1 }).limit(max).lean().exec(),
		db.Board.findOne({ _id: board_id }, BOARD_DISPLAY).lean().exec()
	]);
	return { a_list, b_list, board };
}

module.exports = {
	createBoard, getRootId, recursiveGetBoard, getList
};