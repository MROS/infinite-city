const _ = require("lodash");
const db = require("../database.js");
const isValidObjectId = require("mongoose").Types.ObjectId.isValid;

function _singleTargetBackendRules(target, keys, rules) {
	for (let key of keys) {
		if(!rules[key]) {
			rules[key] = [];
		}
		if (_.isArray(target[key])) {
			rules[key] = rules[key].concat(target[key].map(f => {
				return { caller: target, func: f };
			}));
		}
	}
}
/**
 * 給定一個看板或其 id，找到其從根至最下層的所有後端限制條件
 * @param {Board|String} board
 * @param {String | [String]} keys
 * @param {Article} article 如果有值，則會先抓裡面的規則(onEnter, onCmment 等等)
 * @typedef {{func: String, caller: Object}} Restrict
 * @return {[Restrict]}
 */
async function findBackendRules(board, keys, article=null) {
	if(!keys || keys.length == 0) {
		throw "未指定欲查找的規則";
	}
	else if(!_.isArray(keys)) {
		keys = [keys];
	}

	if(isValidObjectId(board)) {
		board = await db.Board.findOne({ _id: board }).lean().exec();
	}

	let rules = {};
	if(article) {
		_singleTargetBackendRules(article, keys, rules);
	}

	while(!board.isRoot) {
		_singleTargetBackendRules(board, keys, rules);
		board = await db.Board.findOne({ _id: board.parent }).lean().exec();
	}
	_singleTargetBackendRules(board, keys, rules); // 塞入根看板的規則

	if(keys.length == 1) {
		return rules[keys[0]];
	} else {
		return rules;
	}
}

/**
 * @param {String} id 
 * @param {[String]} names
 * @param {Number} depth 
 * @return {Board}
 */
async function recursiveGetBoard(id, names, depth=0) {
	if(names.length == 0) {
		return await db.Board.findOne({ _id: id }).lean().exec();
	}
	else if(depth == names.length - 1) {
		return await db.Board.findOne({ name: names[depth], parent: id }).lean().exec();
	}
	let next_b = await db.Board.findOne({ name: names[depth], parent: id }, { _id: 1 }).lean().exec();
	if(!next_b) {
		throw `找不到看板 ${names[depth]}`;
	}
	return await recursiveGetBoard(next_b._id, names, depth+1);
}

// TODO: 考慮到整個論壇的 board 也不會太多（頂多幾千個）
// 往後利用 redis 來緩存整個看板的樹狀結構，便能有效加速
async function getPathToRoot(board_id) {
	let path = [];
	const fields = {
		"_id": 1,
		"parent": 1,
		"isRoot": 1,
		"name": 1
	};
	let board = await db.Board.findOne({ _id: board_id }, fields).lean().exec();
	while (!board.isRoot) { // 並不包含根
		path.push(board.name);
		board = await db.Board.findOne({ _id: board.parent }, fields).lean().exec();
	}
	return path.reverse();
}

async function getRootId() {
	let root = (await db.Board.findOne({ isRoot: true }, { _id: 1 }).lean().exec());
	if(!root) {
		throw "找不到根看板！";
	}
	return root._id;
}

module.exports = {
	findBackendRules,
	recursiveGetBoard,
	getRootId,
	getPathToRoot
};