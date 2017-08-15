const db = require("../database.js");
const { doRestricts, setRule } = require("../util/util.js");
const { findBackendRules } = require("../util/db_util.js");
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
	setRule(new_board, formRules, "articleForm");
	setRule(new_board, formRules, "commentForm");
	// Render Rules
	setRule(new_board, renderRules, "renderTitle");
	setRule(new_board, renderRules, "renderArticleContent");
	setRule(new_board, renderRules, "renderTitle");
	// backend Rules
	setRule(new_board, backendRules, "onEnter");
	setRule(new_board, backendRules, "onNewBoard");
	setRule(new_board, backendRules, "onNewArticle");
	setRule(new_board, backendRules, "onComment");

	let restricts = await findBackendRules(parent, "onNewBoard");
	let err_msg = doRestricts({ board: new_board }, manager_id, restricts);
	if(err_msg) {
		return { err_msg };
	}

	let new_id = (await db.Board.create(new_board))._id;
	return { _id: new_id };
}

const ARTICLE_INFO_SELECT = {
	title: 1,
	date: 1,
	author: 1,
	articleContent: 1,
};
const BOARD_INFO_SELECT = {
	name: 1,
	manager: 1,
	date: 1,
};
async function getList(board, max, user_id) {
	let restricts = await findBackendRules(board, "onEnter");
	let err_msg = doRestricts({ board: board }, user_id, restricts);
	// TODO: 不能只傳入 board_id，否則難以達到水桶之類的功能！！
	if(err_msg) {
		return { err_msg };
	}
	let [ b_list, a_list, backend_rules ] = await Promise.all([
		db.Board.find({ parent: board._id }, BOARD_INFO_SELECT).sort({ date: 1 }).limit(max).lean().exec(),
		db.Article.find({ board: board._id }, ARTICLE_INFO_SELECT).sort({ date: 1 }).limit(max).lean().exec(),
		findBackendRules(board, ["onNewArticle", "onNewBoard"])
	]);

	let authority = {};
	for(let key of Object.keys(backend_rules)) {
		let msg = doRestricts({ board: board }, user_id, backend_rules[key]);
		if(user_id) {
			authority[key] = { ok: msg ? false : true, msg: msg };
		} else {
			authority[key] = { ok: false, msg: "尚未登入" };
		}
	}

	return { a_list, b_list, board, authority };
}

module.exports = {
	createBoard, getList,
};