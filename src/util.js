// TODO: 將這份檔案切成要用資料庫的+不用資料庫的
// TODO: findBackendRules + recursiveFind 可否合一？
const _ = require("lodash");
const db = require("./database.js");
const isValidObjectId = require("mongoose").Types.ObjectId.isValid;

function array2dict(array, process=null) {
	let ret = {};
	for(let e of array) {
		let label = e.label;
		if(!_.isString(label)) {
			throw `${label} 不是合法的標籤`;
		} else {
			if(process) {
				e = process(e);
			}
			ret[label] = e;
		}
	}
	return ret;
}

const EVAL_TYPES = ["function", "string"];
/**
 * 檢查一個規則是否合法
 * @param {Object|String} rule 
 */
function _checkRule(rule) {
	if(!rule) {
		return false;
	} else if(_.isString(rule)) { // render or backend rules
		return (rule.trim().length > 0);
	} else { // form rules
		if(!EVAL_TYPES.includes(rule.evalType)) {
			throw `不存在的 eval type: ${rule.evalType}`;
		} else {
			return true;
		}
	}
}

/**
 * 可處理後端與前端規則
 * @param {Board | Article} obj 
 * @param {Object} rules
 * @param {String} rule_key
 * @param {Board} parent 
 */
function setRule(obj, rules, rule_key) {
	let rule = rules[rule_key];
	if (_.isArray(rule)) { // 後端規則
		obj[rule_key] = [];
		for (let r of rule) {
			if (_checkRule(r)) {
				obj[rule_key].push(r);
			}
		}
	}
	else if (_checkRule(rule)) {
		obj[rule_key] = rule;
	}
}

/**
 * 用來保證一個文章或推文的內文是合法的
 * @param {Object} content
 * @param {[{ evalType: String, label: String, restrict: String }]} form
 */
function processContent(content, form) {
	if(content.length != form.length) {
		throw "內文和表格長度不匹配";
	}
	let all = array2dict(content, c => c.body);
	for(let i = 0; i < content.length; i++) {
		let [c, f] = [content[i], form[i]];
		if(c.label != f.label) {
			throw `標籤不統一 ${c.label} =/= ${f.label}`;
		}
		c.evalType = f.evalType;
		if (f.restrict.trim().length > 0) {
			let func = eval("(" + f.restrict + ")");
			if (!func(c.body, all)) {
				throw "未通過表格的限制";
			}
		}
	}
}

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

/** TODO: 改成 async function ?
 * @param {article: Object, board: Object} cur_pos 看板、文章或推文
 * @param {String} user_id
 * @param {[Restrict]} restricts 後端限制（字串形式）
 * @return {String}
 */
function doRestricts(cur_pos, user_id, restricts) {
	for (let r of restricts) {
		if (r.func) {
			let func = eval("(" + r.func + ")");
			try {
				func(cur_pos, user_id, r.caller);
			} catch (err) {
				if(_.isString(err)) {
					return err;
				} else {
					return "自定義檢查有誤";
				}
			}
		}
	}
	return null;
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

async function getRootId() {
	let root = (await db.Board.findOne({ isRoot: true }, { _id: 1 }).lean().exec());
	if(!root) {
		throw "找不到根看板！";
	}
	return root._id;
}


module.exports = {
	findBackendRules,
	doRestricts,
	recursiveGetBoard,
	getRootId,
	setRule,
	processContent
};