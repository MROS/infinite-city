let router = require("express").Router();
let _ = require("lodash");
let { getArticles, isExist } = require("./profile.js");

router.get("/", async function(req, res) {
	try {
		let id = req.query.id;
		let is_exist = await isExist(id);
		if (!is_exist) {
			res.status(404).send("無此 id");
		} else {
			let articles = await getArticles(id);
			res.status(200).send(articles);
		}

	} catch (err) {
		res.status(500).send("FAIL");
	}
});

module.exports = router;
