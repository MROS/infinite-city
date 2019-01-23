const db = require("../database.js");
const _ = require("lodash");

const ARTICLE_INFO_SELECT = {
	"data.title": 1,
	"_id": 1
};

async function isExist(id) {
	let user = await db.User.findOne({ id }).lean().exec();
	if (user == null) {
		return false;
	} else {
		return true;
	}
}

async function getArticles(id) {
	let articles = await db.Article.find({ "data.author": id }, ARTICLE_INFO_SELECT).sort({ createdDate: 1 }).lean().exec();
	articles = articles.map(a => {return { title: _.last(a.data).title, id: a._id }; });
	return articles;
}

module.exports = {
	isExist, getArticles
};
