let router = require("express").Router();
let { findUser, encrypt, encryptUser, startVerify,
	getVerifyEmail, deleteGUID, emailUsed } = require("./user.js");
const db = require("../database.js");
const { checkCreateUser, checkEmail, checkId } = require("../../isomorphic/checkAPI.js");

router.post("/new", async function(req, res) {
	let query = req.body;
	if(!checkCreateUser(query)) {
		res.status(400).send("註冊資料不合法");
		return;
	}
	let user = null, email = null;
	try {
		[user, email] = await Promise.all([
			findUser(query.id),
			getVerifyEmail(query.guid)
		]);
	} catch(err) {
		res.status(500).send("FAIL");
		return;
	}

	if(user) {
		res.status(403).send("ID 已被使用");
	} else {
		try {
			user = await encryptUser(query.id, query.password);
			user.date = new Date();
			user.email = email;
			await Promise.all([
				db.User.create(user),
				deleteGUID(query.guid)
			]);
			req.session.user_id = query.id;
			res.send("OK");
		} catch(err) {
			res.status(500).send("FAIL");
			console.log(err);
		}
	}
	// TODO: 新增個人部落格:
});

router.post("/login", async function(req, res) {
	let { id, password } = req.body;
	let user = null;
	try {
		user = await findUser(id);
	} catch(err) {
		res.status(500).send("FAIL");
		console.log(err);
		return;
	}
	if (user && encrypt(password, user.salt) == user.password) {
		req.session.user_id = id;
		res.send("OK");
	}
	else {
		res.status(401).send("帳號或密碼錯誤");
	}
});

router.get("/logout", async function(req, res) {
	if(req.session.user_id) {
		req.session.user_id= null;
		res.send("OK");
	}
	else {
		res.status(401).send("尚未登入");
	}
});

router.get("/who", async function(req, res) {
	if(req.session.user_id) {
		res.json({ login: true, id: req.session.user_id});
	} else {
		res.json({ login: false, id: "" });
	}
});

router.get("/email-used", async function(req, res) {
	let email = req.query.email;
	let used = false;
	if(!checkEmail(email)) {
		res.send("invalid");
	} else {
		used = await emailUsed(email);
		res.send(used ? "used" : "OK");
	}
});
router.get("/id-used", async function(req, res) {
	let id = req.query.id;
	if(!checkId(id)) {
		res.send("invalid");
	} else {
		let user = await findUser(req.query.id);
		res.send(user ? "used" : "OK");
	}
});
router.get("/get-email-by-guid", async function(req, res) {
	let guid = req.query.guid;
	let email = await getVerifyEmail(guid);
	if(email) {
		res.send(email);
	} else {
		res.status(403).send("錯誤或過時的 guid");
	}
});

router.post("/start-verify", async function(req, res) {
	try {
		let email = req.body.email;
		console.log(email);
		if (!email || !checkEmail(email)) {
			res.status(400).send("不合法的 email");
		} else {
			let used = await emailUsed(email);
			if (used) {
				res.status(403).send("email 已被使用");
			} else {
				await startVerify(email);
				res.send("OK");
			}
		}
	} catch(err) {
		console.log(err);
		req.status(500).send("FAIL");
	}
});

module.exports = router;