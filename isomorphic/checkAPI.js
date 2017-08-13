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

function checkFormSeries(f) {
	if (Object.keys(f).length != 3) { return false; }
	if (!Object.keys(f).includes("evalType")) { return false; }
	if (!Object.keys(f).includes("restrict")) { return false; }
	if (!Object.keys(f).includes("label")) { return false; }
	return checkEvalType(f["evalType"]) && checkRestrict(f["restrict"]) && checkLabel(f["label"]);
}

const checkRenderSeries = IsFunctionStringOrOnlyEmpty;
const checkOnSeries = IsFunctionStringOrOnlyEmpty;

const checkArticleTitle = NotOnlyEmpty;
const checkBoardName = NotOnlyEmpty;

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
	checkFormSeries,
	checkRenderSeries,
	checkOnSeries,
	checkArticleTitle,
	checkBoardName,
	checkCreateUser
};
