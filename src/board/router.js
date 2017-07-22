const ObjectId = require("mongoose").Schema.Types.ObjectId;
const db = require("../database.js");
let router = require("express").Router();

router.get("/boardlist/:mather", async function(req, res) {
	let matherId = ObjectId(req.params.mather);
	let boardlist = await db.Board.find({mather: matherId});
	res.json(boardlist);
});

router.post("/new", async function(req, res) {
	if(!req.session.userId) {
		res.send("尚未登入");
	}
	else {
		try {
			await db.Board.create({});
			res.send("OK");
		} catch(err) {
			res.send(err.message);
			console.log(err);
		}

	}
});

module.exports = router;