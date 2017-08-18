// TODO: 將這份檔案切成要用資料庫的+不用資料庫的
// TODO: findBackendRules + recursiveFind 可否合一？
const _ = require("lodash");

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
 * @param {[{_id: String}]} obj_array 
 */
function deleteIDs(obj_array) {
	for(let obj of obj_array) {
		if(!Object.keys(obj).includes("_id")) {
			throw "_id Not included!";
		}
		delete obj["_id"];
	}
}

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

module.exports = {
	doRestricts,
	setRule,
	processContent,
	array2dict,
	deleteIDs
};