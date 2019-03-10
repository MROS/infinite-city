let router = require("express").Router();
let _ = require("lodash");
let { getProfile, isExist, updateProfile } = require("./profile.js");

router.get("/", async function(req, res) {
	try {
		let id = req.query.id;
		let is_exist = await isExist(id);
		if (!is_exist) {
			res.status(404).send("無此 id");
		} else {
			let articles = await getProfile(id);
			res.status(200).send(articles);
		}

	} catch (err) {
		res.status(500).send("FAIL");
	}
});

router.put("/", async function(req, res) {
	try {
		let user_id = req.session.user_id;
		let description = req.body.description;
		updateProfile(user_id, description);
		res.status(200).send("OK");
	} catch (err) {
		console.log(err);
		res.status(500).send("FAIL");
	}
});

module.exports = router;
