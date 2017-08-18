function strictlyIncludes(tar, keys) {
	if(Object.keys(tar).length != keys.length) {
		return false;
	} else {
		for(let key of keys) {
			if(!Object.keys(tar).includes(key)) {
				return false;
			}
		}
	}
	return true;
}

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

function allOK(arr, checkFunc) {
	for (let e of arr) {
		if (!checkFunc(e)) { return false; }
	}
	return true;
}

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

// 後端尚需檢驗 board ID
function checkNewArticle(article, articleForm) {
	let { title, articleContent, formRules, renderRules, backendRules } = article;
	if (!checkArticleTitle(title)) { return false; }
	if (!checkAllMatchRestrict(articleContent, articleForm)) { return false; }
	if (!allOK(Object.values(formRules), checkFormSeries)) { return false; }
	if (!allOK(Object.values(renderRules), checkRenderSeries)) { return false; }
	if (!allOK(Object.values(backendRules), checkOnSeries)) { return false; }
	return true;
}

// 後端尚需檢驗 board ID
function checkNewBoard(board) {
	let { name, formRules, renderRules, backendRules } = board;
	if (!checkBoardName(name)) { return false; }
	if (!allOK(Object.values(formRules), checkFormSeries)) { return false; }
	if (!allOK(Object.values(renderRules), checkRenderSeries)) { return false; }
	if (!allOK(Object.values(backendRules), checkOnSeries)) { return false; }
	return true;
}

function checkEmail(email) {
	if(!email) {
		return false;
	}
	let a = email.split("@");
	if(a.length != 2) { return false; }
	return NotOnlyEmpty(a[0]) && NotOnlyEmpty(a[1]);
}
function checkId(id) {
	return id && NotOnlyEmpty(id) && (id.search(/[ |\n]/) == -1);
}
function checkCreateUser(user) {
	return strictlyIncludes(user, ["guid", "id", "password"])
		&& checkId(user["id"]) && NotOnlyEmpty(user["password"]);
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
	checkBoardName,
	checkArticleTitle,
	checkMatchRestrict,
	checkAllMatchRestrict,
	checkNewBoard,
	checkNewArticle,
	checkCreateUser,
	allOK,
	checkEmail,
	checkId
};
