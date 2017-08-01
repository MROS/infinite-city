const db = require("../database.js");
const { findBackendRules, doRestricts, findFrontendRules } = require("../util.js");

/**
 * @param {Board} board 
 * @param {Board} parent 
 * @param {Object} rules
 * @param {String} can_key 
 * @param {String} rule_key
 */
function setRule(board, parent, rules, can_key, rule_key) {
	if(parent[can_key]) {board[rule_key] = rules[rule_key];}
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
	if(!parent) {
		throw `${ parent_id } 看板不存在`;
	}

	let same_name_board = await db.Board.findOne({ parent: parent_id, name: name },
		{ _id: 1 }).exec();
	if(same_name_board) {
		throw `名字 ${name} 與其它看板重復`;
	}

	let new_board = { parent: parent_id };
	new_board.name = name;
	new_board.manager = [manager_id];
	new_board.depth = parent.depth + 1;
	new_board.date = new Date();
	// Form Rules
	setRule(new_board, parent, formRules, "canDefArticleForm", "articleForm");
	setRule(new_board, parent, formRules, "canDefCommentForm", "commentForm");
	// Render Rules
	setRule(new_board, parent, renderRules, "canDefTitle", "renderTitle");
	setRule(new_board, parent, renderRules, "canDefArticleContent", "renderArticleContent");
	setRule(new_board, parent, renderRules, "canDefTitle", "renderTitle");
	// backend Rules
	new_board.onEnter = backendRules.onEnter;
	new_board.onNewBoard = backendRules.onNewBoard;
	new_board.onNewArticle = backendRules.onNewArticle;
	new_board.onComment = backendRules.onComment;

	let restricts = await findBackendRules(parent_id, "onNewBoard");
	let err_msg = doRestricts(new_board, manager_id, restricts);
	if(err_msg) {
		return { err_msg };
	}

	let new_id = (await db.Board.create(new_board))._id;
	return { _id: new_id };
}

const ARTICLE_SELECT = {
	title: 1,
	date: 1,
	author: 1,
	articleContent: 1,
};
const BOARD_SELECT = {
	name: 1,
	manager: 1,
	date: 1,
};
async function getList(board_id, max, user_id) {
	let restricts = await findBackendRules(board_id, "onEnter");
	let err_msg = doRestricts(board_id, user_id, restricts);
	// TODO: 不能只傳入 board_id，否則難以達到水桶之類的功能！！
	if(err_msg) {
		return { err_msg };
	}
	let [ b_list, a_list, board, rules ] = await Promise.all([
		db.Board.find({ parent: board_id }, BOARD_SELECT).sort({ date: -1 }).limit(max).lean().exec(),
		db.Article.find({ board: board_id }, ARTICLE_SELECT).sort({ date: -1 }).limit(max).lean().exec(),
		db.Board.findOne({ _id: board_id }, BOARD_SELECT).lean().exec(),
		findFrontendRules(board_id, ["renderTitle", "articleForm"])
	]);
	board.renderTitle = rules.renderTitle;
	board.articleForm = rules.articleForm;
	return { a_list, b_list, board };
}

module.exports = {
	createBoard, getList,
};