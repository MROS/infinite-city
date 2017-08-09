const ROOT = {
	name: "無限城",

	// render rules
	renderTitle: "function(article, info) {"
	+ "return `${info.push} [${article.author}] ${article.title}`"
	+ "}",
	renderArticleContent: "function(article, info) {"
	+ "return article.articleContent.join('\n');"
	+ "}",
	renderComment: "function(comment) {"
	+ "return comment.msg.join('\n')"
	+ "}",
	// backend rules
	onNewArticle: [
		"function(cur_pos) {"
		+ "if(cur_pos.board.depth == 0) {"
		+ "throw '不可褻瀆無限城的根';"
		+ "}"
		+ "}"
	],
	onNewBoard: [],
	onEnter: [],
	onComment: [],
	// form rules
	articleForm: [
		{ label: "內容", restrict: "", evalType: "string" }
	],
	commentForm: [
		{ label: "內容", restrict: "", evalType: "string" }
	],

	isRoot: true,
	depth: 0,
	manager: [],
	date: new Date(),
};

module.exports = ROOT;