function checkEvalType(e) {
	return ["string", "function"].includes(e);
}

function onlyEmpty(str) {
	return str.trim().length == 0;
}

function IsFunctionString(str) {
	try {
		let f = eval(`(${str})`);
		return (typeof f) == "function";
	} catch (error) {
		return false;
	}
}

function IsFunctionStringOrOnlyEmpty(str) {
	return onlyEmpty(str) || IsFunctionString(str);
}

let checkRestrict = IsFunctionStringOrOnlyEmpty;

function NotOnlyEmpty(str) {
	return !onlyEmpty(str);
}
const checkLabel = NotOnlyEmpty;

function checkOneForm(f) {
	if (Object.keys(f).length != 3) { return false; }
	if (!Object.keys(f).includes("evalType")) { return false; }
	if (!Object.keys(f).includes("restrict")) { return false; }
	if (!Object.keys(f).includes("label")) { return false; }
	return checkEvalType(f["evalType"]) && checkRestrict(f["restrict"]) && checkLabel(f["label"]);
}

function checkFormSeries(fs) {
	const fault = fs.map(checkOneForm).filter(x => x == false).length;
	if (fault > 0) { return false; }
	const set = new Set(fs.map(f => f.label));
	if (set.size < fs.length) { return false; }
	return true;
}

const checkRenderSeries = IsFunctionStringOrOnlyEmpty;
const checkOnSeries = IsFunctionStringOrOnlyEmpty;

const checkArticleTitle = NotOnlyEmpty;
const checkBoardName = NotOnlyEmpty;

function matchRestrict(content, item) {
	if (onlyEmpty(item.restrict)) {
		return true;
	} else {
		const verifyFunction = eval(`(${item.restrict})`);
		return verifyFunction(content[item.label], content);
	}
}

function checkMatchRestrict(label, content, form) {
	const findItem = (label) => {
		for (let item of form) {
			if (item.label == label) {
				return item;
			}
		}
	};
	const item = findItem(label);
	return matchRestrict(content, item);
}

function checkAllMatchRestrict(content, form) {
	for (let item of form) {
		if (matchRestrict(content, item)) {
			continue;
		} else {
			return false;
		}
	};
	return true;
}

function _checkEmail(email) {
	let a = email.split("@");
	if(a.length != 2) { return false; }
	return NotOnlyEmpty(a[0]) && NotOnlyEmpty(a[1]);
}
function checkCreateUser(user) {
	if (Object.keys(user).length != 3) { return false; }
	if (!Object.keys(user).includes("email")) { return false; }
	if (!Object.keys(user).includes("id")) { return false; }
	if (!Object.keys(user).includes("password")) { return false; }
	if (user["id"].search(/[ |\n]/) != -1) { return false; }
	return _checkEmail(user["email"]) && NotOnlyEmpty(user["id"]) && NotOnlyEmpty(user["password"]);
}

module.exports = {
	checkEvalType,
	onlyEmpty,
	IsFunctionString,
	checkRestrict,
	checkLabel,
	checkOneForm,
	checkFormSeries,
	checkRenderSeries,
	checkOnSeries,
	checkArticleTitle,
	checkMatchRestrict,
	checkAllMatchRestrict,
	checkBoardName,
	checkCreateUser
};
