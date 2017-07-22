const config = require("./config.js");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;
mongoose.Promise = global.Promise;

let env = require("optimist").argv.env || process.env.env || "dev";
console.log(`環境：${env}`);
let server = (() => {
	switch (env) {
		case "dev":
			return config.dev_server;
		case "test":
			return config.test_server;
		default:
			throw `未知的環境：${env}`;
	}
})();
mongoose.connect(server.url, server.options)
.then(
	() => console.log("資料庫連結成功"),
	err => console.error("資料庫連結失敗")
);

const board_schema_t = {
	"isRoot": { type: Boolean, default: false },
	"mather": {
		type: ObjectId,
		required: function() {
			if(this.mather) return false;
			else return !this.isRoot;
		}
	},
	"name": { type: String, required: true },

	// 以下三個其實是函數，這個板下所有的文章／回應／回應表格都要經過它們來渲染
	"renderContent": { type: String, default: null },
	"renderComment": { type: String, default: null },
	"renderCommentForm": { type: String, default: null },

	"allowDefineContent": { type: Boolean, default: true }, // 允許子板和文章定義「渲染內文」
	"allowDefineComment": { type: Boolean, default: true }, // 允許子板和文章定義「渲染回應」
	"allowDefineForm": { type: Boolean, default: true }, // 允許子板和文章定義「渲染回應表單」
	// 若禁止定義，則內文或子板就只能定義 content，由板面定義的函數來渲染

	"manager": { // 板主名單
		type: [String],
		required: function(){
			return this.manager.length == 0;
		}
	}
};

const article_schema_t = {
	"board": { type: ObjectId, required: true },
	"title": { type: String, required: true },

	// 以下三個其實是函數，這篇文章下的內文／回應／回應表格都要經過它們來渲染
	"renderContent": String,
	"renderComment": String,
	"renderCommentForm": String,

	"arthur": String,
	"date": { type: Date, default: Date.now },

	// 底下開始是文章真正的資料
	"content": String, // 其實是函數，希望有朝一日真的變成字串，用模板的方式渲染
	"commentForm": String, // 其實是函數，希望有朝一日真的變成字串，用模板的方式渲染
	"comment": [{}],
};

const user_schema_t = {
	// id 例如 infinitycity5566
	"id": { type: String, index: true },
	"password": { type: String, required: true }
};

let board_schema = new Schema(board_schema_t);
let Board = mongoose.model("Board", board_schema);

let article_schema = new Schema(article_schema_t);
let Article = mongoose.model("Article", article_schema);

let user_schema = new Schema(user_schema_t);
let User = mongoose.model("User", user_schema);

module.exports = {
	Board,
	Article,
	User
};