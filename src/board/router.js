const db = require("../database.js");
let router = require("express").Router();

let { createBoard, getRootId, recursiveGetBoard } = require("./board.js");

router.get("/browse", async function(req, res) {
	try {
		let max = Number(req.query.max) || 10;
		let name = [];
		if (req.query.name) name = req.query.name.split(",");
		let root_id = req.query.base;
		if (!root_id) root_id = await getRootId();

		let board_id = await recursiveGetBoard(root_id, name, 0);
		res.redirect(`${req.baseUrl}/list/${board_id}?max=${max}`);
	} catch (err) {
		res.status(400).send(err.message);
		console.log(err);
	}
});

/*router.get("/rootlist", async function(req, res) {
	let max = Number(req.query.max) || 10;
	let root_id = "";
	try {
		root_id = await getRootId();
		res.redirect(`${req.baseUrl}/list/${root_id}?max=${max}`);
	} catch (err) {
		console.log(err);
	}
})*/

router.get("/list/:board", async function (req, res) {
	try {
		let max = Number(req.query.max) || 10;
		let board_id = req.params.board;
		let [b_list, a_list] = await Promise.all([
			db.Board.find({ parent: board_id }).sort({ date: -1 }).limit(max).exec(),
			db.Article.find({ board: board_id }).sort({ date: -1 }).limit(max).exec(),
		]);
		res.json({ b_list, a_list, board_id });
	} catch (err) {
		// console.log(err);
		res.send("FAIL");
	}
});

router.post("/new", async function(req, res) {
	let userId = req.session.userId;
	try {
		if (!userId) {
			res.send("尚未登入");
		}
		else {
			let query = req.body;
			await createBoard(userId, query.name, query.parent,
				query.articleForm, query.rules);
			res.send("OK");
		}
	} catch(err) {
		console.log(err);
		res.send("FAIL");
	}
});

module.exports = router;