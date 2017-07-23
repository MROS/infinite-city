const ObjectId = require("mongoose").Schema.Types.ObjectId;
const db = require("../database.js");
let router = require("express").Router();

let { createBoard } = require("./board.js");

router.get("/boardlist/:mather", async function(req, res) {
	let mather_id = ObjectId(req.params.mather);
	let boardlist = await db.Board.find({mather: mather_id});
	res.json(boardlist);
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
			req.send("OK");
		}
	} catch(err) {
		console.log(err);
		req.send("FAIL");
	}
});

module.exports = router;