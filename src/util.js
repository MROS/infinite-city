const _ = require("lodash");
const db = require("./database.js");

/**
 * 檢查一個規則是否為空字串
 * @param {Object|String} rule 
 */
function _checkRule(rule) {
	if(!rule) {
		return false;
	} else if(_.isString(rule) && rule.trim.length > 0) {
		return false;
	} else {
		return true;
	}
}

/**
 * 可處理後端與前端規則
 * @param {Board} obj 
 * @param {Object} rules
 * @param {String} rule_key
 * @param {Board} parent 
 * @param {String} can_key 若未傳入則代表無限制
 */
function setRule(obj, rules, rule_key, parent, can_key) {
	if(!can_key || parent[can_key]) {
		let rule = rules[rule_key];
		if(_.isArray(rule)) {
			obj[rule_key] = [];
			for(let r of rule) {
				if (_checkRule(r)) {
					obj[rule_key].push(r);
				}
			}
		}
		else if(_checkRule(rule)) {
			obj[rule_key] = rule;
		}
	}
	if(can_key && rules[can_key]) {
		obj[can_key] = rules[can_key] && parent[can_key];
	}
}

function _prepareFindRules(rule_key) {
	if(!rule_key || rule_key.length == 0) {
		throw "未指定欲查找的規則！";
	}
	else if(!_.isArray(rule_key)) {
		 rule_key = [rule_key];
	}
	let rules = {}, select = { _id: 1, isRoot: 1, parent: 1 };
	for(let key of rule_key) {
		rules[key] = [];
		select[key] = 1;
	}
	return { rule_key, select, rules };
}

/**
 * 給定一個看板或文章的 id，找到其從根至最下層的所有後端限制條件
 * @typedef {{func: String, caller: Object}} Restrict
 * @return {[Restrict]}
 */
async function findBackendRules(b_id, key) {
	let { rule_key, select, rules } = _prepareFindRules(key);
	select["depth"] = 1;
	select["manager"] = 1;
	let cur_b = null;
	do {
		cur_b = await db.Board.findOne({ _id: b_id }, select).lean().exec();
		for(let key of rule_key) {
			if(cur_b[key] && cur_b[key].length > 0) { // 找到規則！
				for(let func of cur_b[key]) {
					rules[key].push({ caller: cur_b, func: func });
				}
			}
		}
		b_id = cur_b.parent;
	} while(!cur_b.isRoot);

	if(rule_key.length == 1) {
		return rules[rule_key[0]];
	} else {
		return rules;
	}
}

/**
 * 給定一個看板或文章的 id，找到其從根至最下層的所有前段渲染規則
 * @return {[String]}
 */
async function findFrontendRules(b_id, key) {
	let { rule_key, select, rules } = _prepareFindRules(key);
	let cur_b = null;
	let done = 0;
	do {
		cur_b = await db.Board.findOne({ _id: b_id }, select).lean().exec();
		for(let key of rule_key) {
			if(!rules[key] && cur_b[key]) { // 找到缺乏的規則！
				rules[key] = cur_b[key];
				done++;
			}
		}
		b_id = cur_b.parent;
	} while(!cur_b.isRoot && done < rule_key.length);
	if(rule_key.length == 1) {
		return rules[rule_key[0]];
	} else {
		return rules;
	}
}

/** TODO: 改成 async function ?
 * @param {article: Object, board: Object} arg 看板、文章或推文
 * @param {String} user_id
 * @param {[String]} str_restricts 後端限制（字串形式）
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
					return err.message;
				}
			}
		}
	}
	return null;
}

async function recursiveGetBoard(id, name, depth=0) {
	if(depth == name.length) {
		return id;
	}
	let next_b = await (db.Board.findOne({ name: name[depth], parent: id }, { _id: 1 }).lean().exec());
	if(!next_b) {
		throw `找不到看板 ${name[depth]}`;
	}
	return await recursiveGetBoard(next_b._id, name, depth+1);
}

async function getRootId() {
	let root = (await db.Board.findOne({ isRoot: true }, { _id: 1 }).lean().exec());
	if(!root) {
		throw "根看板尚未建立！";
	}
	return root._id;
}


module.exports = {
	findBackendRules,
	findFrontendRules,
	doRestricts,
	recursiveGetBoard,
	getRootId,
	setRule
};