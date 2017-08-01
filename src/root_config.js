const ROOT = {
	isRoot: true,
	depth: 0,
	manager: [],
	date: new Date(),

	name: "無限城",
	renderTitle: "function(article, info) {"
	+ "return `${info.push} [${article.author}] ${article.title}`"
	+ "}",
	renderArticleContent: "function(article, info) {"
	+ "return article.articleContent.join('\n');"
	+ "}",
	renderComment: "function(comment) {"
	+ "return comment.msg.join('\n')"
	+ "}"
};

module.exports = ROOT;