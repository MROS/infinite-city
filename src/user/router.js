const db = require("../database.js");
let router = require("express").Router();
let crypto = require("crypto");

async function findUser(id) {
	let user = await db.User.findOne({ id }).exec();
	return user;
}

async function userExist(id) {
	return (await db.User.findOne({ id }).exec());
}


function encrypt(password, salt) {
	return crypto.pbkdf2Sync(password, salt, 4096, 256, "sha512").toString("hex");
}
function encryptUser(id, password) {
	return new Promise((resolve, reject) => {
		crypto.randomBytes(128, function (err, salt) {
			if (err) { reject(err); }
			salt = salt.toString("hex");
			password = encrypt(password, salt);
			resolve({ id, password, salt });
		});
	});
}

router.post("/new", async function(req, res) {
	let query = req.body;
	let user = null;
	try {
		user = await userExist(query.id);
	} catch(err) {
		res.status(400).send(err);
	}

	if(user) {
		res.status(403).send("ID 已被使用");
	}
	else {
		try {
			user = await encryptUser(query.id, query.password);
			user.date = new Date();
			await db.User.create(user);
			req.session.userId = query.id;
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
		req.session.userId = id;
		res.send("OK");
	}
	else {
		res.status(500).send("FAIL");
	}
});

router.get("/logout", async function(req, res) {
	if(req.session.userId) {
		req.session.userId = null;
		res.send("OK");
	}
	else {
		res.status(401).send("尚未登入");
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