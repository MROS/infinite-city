const db = require("../database.js");
let router = require("express").Router();

let { createBoard } = require("./board.js");

router.get("/rootlist", async function(req, res) {
	let max = 10 || Number(req.query.max);
	let root_id = "";
	try {
		root_id = (await db.Board.findOne({ isRoot: true }, { _id: 1 }).lean().exec())._id;
		res.redirect(`${req.baseUrl}/list/${root_id}?max=${max}`);
	} catch (err) {
		console.log(err);
	}
});

router.get("/list/:board", async function (req, res) {
	try {
		let max = 10 || Number(req.query.max);
		let board_id = req.params.board;
		console.log(board_id, max);
		let [b_list, a_list] = await Promise.all([
			db.Board.find({ mather: board_id }).limit(max).exec(),
			db.Article.find({ board: board_id }).limit(max).exec(),
		]);
		res.json({ b_list, a_list });
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
			await createBoard(userId, query.name, query.mather, query.rules);
			res.send("OK");
		}
	} catch(err) {
		console.log(err);
		res.send("FAIL");
	}
});

module.exports = router;