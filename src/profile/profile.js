const db = require("../database.js");
const db_util = require("../util/db_util.js");
const _ = require("lodash");

const ARTICLE_INFO_SELECT = {
	"data.title": 1,
	"_id": 1,
	"board": 1,
};

async function isExist(id) {
	let user = await db.User.findOne({ id }).lean().exec();
	if (user == null) {
		return false;
	} else {
		return true;
	}
}

async function getProfile(id) {
	let articles = await db.Article.find({ "data.author": id }, ARTICLE_INFO_SELECT).sort({ createdDate: 1 }).lean().exec();
	let user = await db.User.findOne({ id }).exec();
	let ret = { articles: [], description: user.description };
	for (let a of articles) {
		let path = await db_util.getPathToRoot(a.board);
		ret.articles.push({
			title: _.last(a.data).title,
			id: a._id,
			board: a.board,
			path: path
		});
	}
	return ret;
}

async function updateProfile(id, description) {
	await db.User.findOneAndUpdate({ id }, { description });
	return;
}

module.exports = {
	isExist, getProfile, updateProfile
};
