const db = require("./database.js");

/**
 * 給定一個看板或文章的 id，找到其從根至最下層的所有後端限制條件
 * @param {Object} arg
 * @param {String} arg.a_id
 * @param {String} arg.b_id
 * @param {String} arg.rule_name
 * @return {[String]}
 */
function findBackendRules(arg) {
	// TODO:
	return [];
}

/**
 * @param {Object} obj 看板、文章或推文
 * @param {String} user_id
 * @param {[String]} str_restricts 後端限制（字串形式）
 * @return {String}
 */
function doRestricts(obj, user_id, str_restricts) {
	for(let str of str_restricts) {
		let func = eval("(" + str + ")");
		try {
			func(obj, user_id);
		} catch(err) {
			return err.message;
		}
	}
	return null;
}

module.exports = {
	findBackendRules,
	doRestricts
};