let router = require("express").Router();
let _ = require("lodash");
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
		console.log(err);
		if(_.isString(err)) { // 自定的錯誤
			res.send(err);
		} else {
			res.status(400).send("FAIL");
		}
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
			let new_b = await createBoard(userId, query.name, query.parent,
				query.formRules, query.renderRules, query.backendRules);
			if(new_b.err_msg) {
				res.send(new_b.err_msg);
			}
			else {
				res.json(new_b);
			}
		}
	} catch(err) {
		console.log(err);
		if(_.isString(err)) { // 自定的錯誤
			res.send(err);
		} else {
			res.status(400).send("FAIL");
		}
	}
});

module.exports = router;