function defaultBoard(name, parent) {
	return {
		name: name,
		parent: parent,
		formRules: {},
		renderRules: {},
		backendRules: {}
	};
}
let b1 = defaultBoard.bind(null, "b1");
let b2 = p => {
	let b = defaultBoard("b2", p);
	b.backendRules.onNewArticle = [(function (cur_pos, user_id, caller) {
		if (cur_pos.board.depth == caller.depth) {
			if (!caller.manager.includes(user_id)) {
				throw "只有板主可在此發文";
			}
		}
	}).toString()];
	return b;
};
let b3 = defaultBoard.bind(null, "b3");
let b4 = defaultBoard.bind(null, "b4");
let b5 = defaultBoard.bind(null, "b5");

function defaultArticle(title, board) {
	return {
		title: title,
		board: board,
		articleContent: [
			{ label: "內容", body: "" }
		],
		formRules: {},
		renderRules: {},
		backendRules: {}
	};
}
let a0 = defaultArticle.bind(null, "a0");
let a1 = defaultArticle.bind(null, "a1");
let a2 = b => {
	let a = defaultArticle("a2", b);
	a.formRules.commentForm = [
		{ label: "password", restrict: "", evalType: "string" },
		{ label: "valid", restrict: "(cur, all) => (all.password == cur)", evalType: "string" }
	];
	return a;
};

function defaultComment(article) {
	return {
		article: article,
		commentContent: [
			{ label: "內容", body: "" }
		],
	};
}
let c0 = defaultComment;
let c1 = a => {
	let c = defaultComment(a);
	c.commentContent = [
		{ label: "password", body: "1234" },
		{ label: "valid", body: "1234" },
	];
	return c;
};
let c2 = a => {
	let c = defaultComment(a);
	c.commentContent = [
		{ label: "password", body: "4567" },
		{ label: "valid", body: "4567" },
	];
	return c;
};
let cx0 = a => {
	let c = defaultComment(a);
	c.commentContent = [
		{ label: "password", body: "5678" },
		{ label: "valid", body: "1234" },
	];
	return c;
};
let cx1 = a => {
	let c = defaultComment(a);
	c.commentContent = [
		{ label: "password", body: "5678" },
	];
	return c;
};
let cx2 = a => {
	let c = defaultComment(a);
	c.commentContent = [
		{ label: "password", body: "5678" },
		{ label: "fuck", body: "5678" },
	];
	return c;
};

module.exports = {
	b1, b2, b3, b4, b5,
	a0, a1, a2,
	c0, c1, c2, cx0, cx1, cx2
};