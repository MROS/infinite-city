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
		"function(cur_pos, user_id) {"
		+ "if(cur_pos.board.depth == 0) {"
		+ "if(!cur_pos.board.manager.includes(user_id)) {"
		+ "throw '不可褻瀆無限城的根';"
		+ "}"
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

	description: "無線城的所有看板，以樹狀結構組織，根看板即爲這顆樹的根節點",
	isRoot: true,
	depth: 0,
	manager: [],
	date: new Date(),
};

module.exports = ROOT;