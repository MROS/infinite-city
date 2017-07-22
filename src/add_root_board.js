const db = require("./database.js");

let root = {
	isRoot: true,
	manager: ["did0u0"],
	name: "無限城",

	renderContent: function(article) {
		let doms = article.content().map(c => {
			return <p>{c}</p>;
		});
		return <div>{doms}</div>;
	},
	renderComment: function(comment) {
		let doms = Object.keys(comment).map(key => {
			return <p>{comment[key]}</p>;
		});
		return <div>{doms}</div>;
	},
	renderCommentForm: function(commentForm) {
		let doms = [];
		for(let c of commentForm) {
			let applyRestrict = function() {
				let ok = c.restrict(this.value);
				if(ok) c.style.color = "red";
				else c.style.color = "black";
			};
			let dom = <p>
				<label>{c.label}</label>
				<input type="text" name={c.name} onChange={applyRestrict.bind(this)}></input>
			</p>;
			doms.push(dom);
		}
		return <div>{doms}</div>;
	}
};

async function addRoot(root) {
	for (let userId of root.manager) {
		let user = await db.User.findOne({id: userId});
		if(!user) {
			console.log(`${userId} 不存在`);
			process.exit();
		}
	}

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