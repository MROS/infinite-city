let router = require("express").Router();
let { createBoard, getList } = require("./board.js");
let { recursiveGetBoard, getRootId } = require("../util.js");

router.get("/browse", async function(req, res) {
	try {
		let max = Number(req.query.max) || 10;
		let name = [];
		if (req.query.name) {
			name = req.query.name.split(",");
		}
		let root_id = req.query.base;
		if (!root_id) {
			root_id = await getRootId();
		}
		let board_id = await recursiveGetBoard(root_id, name);
		let list = await getList(board_id, max, req.session.userId);
		if(list.err_msg) {
			res.send(list.err_msg);
		}
		else {
			res.json(list);
		}
	} catch (err) {
		res.status(400).send("FAIL");
		console.log(err);
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
			let err_msg = await createBoard(userId, query.name, query.parent,
				query.formRules, query.renderRules, query.backendRules);
			if(err_msg) {res.send(err_msg);}
			else {res.send("OK");}
		}
	} catch(err) {
		console.log(err);
		res.status(400).send("FAIL");
	}
});

module.exports = router;