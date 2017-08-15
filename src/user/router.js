let router = require("express").Router();
let { findUser, encrypt, encryptUser, startVerify, verify, emailUsed} = require("./user.js");
const db = require("../database.js");
const { checkCreateUser, checkEmail, checkId } = require("../../isomorphic/checkAPI.js");

router.post("/new", async function(req, res) {
	let query = req.body;
	if(!checkCreateUser(query)) {
		res.status(400).send("註冊資料不合法");
		return;
	}
	let user = null, email_used = false;
	let guid = "";
	try {
		[user, email_used] = await Promise.all([
			findUser(query.id),
			emailUsed(query.email)
		]);
	} catch(err) {
		res.status(500).send("FAIL");
		return;
	}

	if(user) {
		res.status(403).send("ID 已被使用");
	} else if(email_used) {
		res.status(403).send("e-mail 已被使用");
	}
	else {
		try {
			[user, guid] = await Promise.all([
				encryptUser(query.id, query.password),
				startVerify(query.id, query.email)
			]);
			user.date = new Date();
			user.email = query.email;
			await db.User.create(user);
			req.session.user_id = query.id;
			req.session.verified = false;
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
		req.session.verified = user.verified;
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

router.get("/verification", async function(req, res) {
	try {
		let [user_id, guid] = [req.session.user_id, req.query.guid];
		if(!user_id) {
			res.status(401).send("尚未登入");
		} else {
			if (req.session.verified) {
				res.status(403).send("重複認證");
				return;
			}
			let ok = await verify(user_id, guid);
			if (ok) {
				res.send("OK");
				await db.User.update({ id: user_id }, { verified: true }).exec();
				req.session.verified = true;
			} else {
				res.status(403).send("FAIL");
			}
		}
	} catch (err) {
		console.log(err);
		res.status(500).send("FAIL");
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

module.exports = router;