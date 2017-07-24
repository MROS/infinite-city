const db = require("../database.js");
let router = require("express").Router();

async function findUser(query) {
	let [ id, password ] = [ query.id, query.password ];
	let user = await db.User.findOne({ id, password }).exec();
	return user;
}

async function userExist(id) {
	return (await db.User.findOne({ id }).exec());
}

router.post("/new", async function(req, res) {
	let query = req.body;
	let user = null;
	try {
		user = await userExist(query.id);
	} catch(err) {
		res.send(err);
	}

	if(user) {
		res.send("ID 已被使用");
	}
	else {
		try {
			await db.User.create({
				id: query.id,
				password: query.password
			});
			req.session.userId = query.id;
			res.send("OK");
		} catch(err) {
			res.send("FAIL");
			console.log(err);
		}
	}
	// TODO: 新增個人部落格:
});

router.post("/login", async function(req, res) {
	let query = req.body;
	let user = null;
	try {
		user = await findUser(query);
	} catch(err) {
		res.send(err);
	}
	if(user) { // 登入成功
		req.session.userId = user.id;
		res.send("OK");
	}
	else {
		res.send("FAIL");
	}
});

router.get("/logout", async function(req, res) {
	if(req.session.userId) {
		req.session.userId = null;
		res.send("OK");
	}
	else {
		res.send("尚未登入");
	}
});

router.get("/who", async function(req, res) {
	if(req.session.userId) {
		res.json({ login: true, id: req.session.userId });
	} else {
		res.json({ login: false, id: "" });
	}
});

module.exports = router;