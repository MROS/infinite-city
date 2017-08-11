const API = require("../checkAPI.js");

test("checkEvalType 只接受 string 和 function", () => {
	expect(API.checkEvalType("string")).toBe(true);
	expect(API.checkEvalType("function")).toBe(true);
	expect(API.checkEvalType("XXXX")).toBe(false);
});

test("onlyEmpty 只接受能看不到字的字串", () => {
	expect(API.onlyEmpty(" \n \t")).toBe(true);
	expect(API.onlyEmpty("     ")).toBe(true);
	expect(API.onlyEmpty("\t\t ")).toBe(true);
	expect(API.onlyEmpty("XXXXX")).toBe(false);
	expect(API.onlyEmpty("   XX \t ")).toBe(false);
});

test("IsFunctionString 只接受能被求值爲函式的字串", () => {
	expect(API.IsFunctionString("function(){}")).toBe(true);
	expect(API.IsFunctionString("function(a){ return a; }")).toBe(true);
	expect(API.IsFunctionString("() => {}")).toBe(true);
	expect(API.IsFunctionString("function")).toBe(false);
	expect(API.IsFunctionString("let a = 1;")).toBe(false);
	expect(API.IsFunctionString("1")).toBe(false);
	expect(API.IsFunctionString("XXXXXXXX")).toBe(false);
});

test("checkRestrict、checkRenderSeries、checkOnSeries 爲 onlyEmpty 或 isFunctionString", () => {
	const checks = [API.checkRestrict, API.checkRenderSeries, API.checkOnSeries];
	for (let c of checks) {
		expect(c(" \n \t")).toBe(true);
		expect(c("\t\t ")).toBe(true);
		expect(c("XXXXX")).toBe(false);
		expect(c("   XX \t ")).toBe(false);
		expect(c("function(){}")).toBe(true);
	}
});

test("checkLabel、checkArticleTitle、checkBoardName 不能都看不到字", () => {
	const checks = [API.checkLabel, API.checkArticleTitle, API.checkBoardName];
	for (let c of checks) {
		expect(c(" \n \t")).toBe(false);
		expect(c("")).toBe(false);
		expect(c(" ")).toBe(false);
		expect(c("內容")).toBe(true);
	}
});

test("checkFormSeries 爲一個恰有 evalType、restrict、label 的物件", () => {
	const f1 = {
		evalType: "string"
	};
	const f2 = {
		evalType: "string",
		restrict: "function(){}",
		label: "XX",
	};
	const f3 = {
		evalType: "string",
		restrict: "1",
		label: "XX",
	};
	const f4 = {
		evalType: "string",
		restrict: "function(){}",
		label: "XX",
		a: 1,
	};
	expect(API.checkFormSeries(f1)).toBe(false);
	expect(API.checkFormSeries(f2)).toBe(true);
	expect(API.checkFormSeries(f3)).toBe(false);
	expect(API.checkFormSeries(f4)).toBe(false);
});