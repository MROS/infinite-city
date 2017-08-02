let router = require("express").Router();
const _ = require("lodash");
let { createComment } = require("./comment.js");
const db = require("../database.js");

router.post("/new", async function(req, res) {
	let userId = req.session.userId;
	try {
		if(!userId) {
			res.send("尚未登入");
		}
		else {
			let query = req.body;
			let new_c = await createComment(userId, query.article, query.commentContent);
			if (new_c.err_msg) {
				res.send(new_c.err_msg);
			}
			else {
				res.json(new_c);
			}
		}
	} catch(err) {
		console.log(err);
		if(_.isString(err)) {
			res.send(err);
		} else {
			res.status(400).send("FAIL");
		}
	}
});

module.exports = router;