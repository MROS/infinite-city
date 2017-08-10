const db = require("../database.js");
const { findBackendRules, doRestricts, findFrontendRules, setRule } = require("../util.js");

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
	setRule(new_board, formRules, "articleForm", parent, "canDefArticleForm");
	setRule(new_board, formRules, "commentForm", parent, "canDefCommentForm");
	// Render Rules
	setRule(new_board, renderRules, "renderTitle", parent, "canDefTitle");
	setRule(new_board, renderRules, "renderArticleContent", parent, "canDefArticleContent");
	setRule(new_board, renderRules, "renderTitle", parent, "canDefTitle");
	// backend Rules
	setRule(new_board, backendRules, "onEnter");
	setRule(new_board, backendRules, "onNewBoard");
	setRule(new_board, backendRules, "onNewArticle");
	setRule(new_board, backendRules, "onComment");

	let restricts = await findBackendRules(parent_id, "onNewBoard");
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
async function getList(board_id, max, user_id) {
	let restricts = await findBackendRules(board_id, "onEnter");
	let err_msg = doRestricts({ board: board_id }, user_id, restricts);
	// TODO: 不能只傳入 board_id，否則難以達到水桶之類的功能！！
	if(err_msg) {
		return { err_msg };
	}
	let [ b_list, a_list, board, frontend_rules, backend_rules ] = await Promise.all([
		db.Board.find({ parent: board_id }, BOARD_INFO_SELECT).sort({ date: 1 }).limit(max).lean().exec(),
		db.Article.find({ board: board_id }, ARTICLE_INFO_SELECT).sort({ date: 1 }).limit(max).lean().exec(),
		db.Board.findOne({ _id: board_id }).lean().exec(),
		findFrontendRules(board_id, ["renderTitle", "renderArticleContent", "renderComment",
			"articleForm", "commentForm"]),
		findBackendRules(board_id, ["onNewArticle", "onNewBoard"])
	]);
	board.renderTitle = frontend_rules.renderTitle;
	board.renderArticleContent = frontend_rules.renderArticleContent;
	board.renderComment = frontend_rules.renderComment;
	board.articleForm = frontend_rules.articleForm;
	board.commentForm = frontend_rules.commentForm;

	let forbidden = {};
	for(let key of Object.keys(backend_rules)) {
		let msg = doRestricts({ board: board }, user_id, backend_rules[key]);
		if(msg) {
			forbidden[key] = msg;
		}
	}

	return { a_list, b_list, board, forbidden };
}

module.exports = {
	createBoard, getList,
};