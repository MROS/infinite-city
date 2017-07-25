const db = require("../database.js");
let router = require("express").Router();
let { createComment } = require("./comment.js");

router.post("/new", async function(req, res) {
	let userId = req.session.userId;
	try {
		if(userId) {
			res.send("尚未登入");
		}
		else {
			let query = req.body;
			await createComment(userId, query.article, query.msg);
		}
	} catch(err) {
		console.log(err);
		res.status(400).send(err.message);
	}
});

module.exports = router;