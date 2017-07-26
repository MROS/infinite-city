const db = require("./database.js");

let root = {
	isRoot: true,
	manager: [],
	name: "無限城",

	renderTitle: "function(article, info) {"
	+ "return <h3>[{info.push}]{article.title}</h3>;"
	+ "}",
	renderArticleContent: "function(article, info) {"
	+ "let doms = article.content().map(c => {"
	+ "return <p>{c}</p>;"
	+ "});"
	+ "return <div>{doms}</div>;"
	+ "}",
	renderComment: "function(comment) {"
	+ "let doms = comment.map(obj => {"
	+ "return <p>{obj}</p>;"
	+ "});"
	+ "return <div>{doms}</div>;"
	+ "}",
	renderCommentForm: "function(commentForm) {"
	+ "let doms = [];"
	+ "for(let c of commentForm) {"
	+ "let applyRestrict = function() {"
	+ "let ok = c.restrict(this.value);"
	+ "if(ok) c.style.color = 'red';"
	+ "else c.style.color = 'black';"
	+ "};"
	+ "let dom = <p>"
	+ "<label>{c.label}</label>"
	+ "<input type='text' name={c.name} onChange={applyRestrict.bind(this)}></input>"
	+ "</p>;"
	+ "doms.push(dom);"
	+ "}"
	+ "return <div>{doms}</div>;"
	+ "}",
	renderArticleForm: "function(articleForm) {"
	+ "let doms = articleForm.map(obj => {"
	+ "return <p><lebel>{obj.lebel}</lebel><input type='text'/></p>;"
	+ "});"
	+ "return <div>{doms}</div>;"
	+ "}",
};

async function addRoot(root) {
	try {
		let res = await db.Board.findOne({ isRoot: true }).exec();
		if (res) {
			console.log("根看板已經存在");
			// 更新？
		}
		else {
			await db.Board.create(root);
			console.log("根看板創建成功");
		}
	} catch(err) {
		console.log(err.message);
	}
	process.exit();
}

addRoot(root);