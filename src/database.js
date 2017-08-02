const mongoose = require("mongoose");
const config = require("./config.js");
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
	"depth": { type: Number, required: true },
	"date": { type: Date, required: true },
	"parent": {
		type: ObjectId,
		required: function() {
			if (this.parent) { return false; }
			else { return !this.isRoot; }
		}
	},
	"name": { type: String, required: true },

	// 以下為 renderRules
	"renderTitle": { type: String, default: null },
	"renderArticleContent": { type: String, default: null },
	"renderComment": { type: String, default: null },
	// 以上幾個其實是函數，這個板下所有的文章標題/文章／回應／回應表格都要經過它們來渲染
	"canDefTitle": { type: Boolean, default: true }, // 允許子板定義「渲染標題」
	"canDefArticleContent": { type: Boolean, default: true }, // 允許子板定義「渲染內文」
	"canDefComment": { type: Boolean, default: true }, // 允許子板「和文章」定義「渲染回應」
	// 若禁止定義，則內文或子板就只能定義 content 和 commentForm，由板面定義的函數來渲染

	// 以下為 Backend Rules TODO: 這部分的支援
	"onEnter": [String], // 進入看板或文章時在「後端」進行的檢查，可以實現私密看板
	"onNewBoard": [String], // 創立子板時在「後端」進行的檢查
	"onNewArticle": [String], // 提交文章時在「後端」進行的檢查
	"onComment": [String], // 提交留言時在「後端」進行的檢查
	// 注意，如果完全要禁止子板自行定義限制也是做得到的，只要在 onNewBoard 裡面檢查子看板 onXXX 陣列的長度，假如有多的就禁止創板

	// 以下為 Form Rules
	"articleForm": [{ evalType: String, label: String, restrict: String }],
	"commentForm": [{ evalType: String, label: String, restrict: String }],
	"canDefArticleForm": { type: Boolean, default: true },
	"canDefCommentForm": { type: Boolean, default: true },

	"manager": { // 板主名單
		type: [String],
		required: function(){
			return (this.manager.length == 0) && !this.isRoot;
		},
	},
};

const article_schema_t = {
	"title": { type: String, required: true },
	"board": { type: ObjectId, required: true },
	"date": { type: Date, required: true },
	"author": String, // 若是匿名看板，可以無作者

	// Render Rules
	"renderComment": { type: String, default: null },
	// Backend Rules
	"onComment": [String], // 提交留言時在「後端」進行的檢查
	"onEnter": [String], // 進入文章時在「後端」進行的檢查，可以實現告白文（之類的）
	// Form Rules
	"commentForm": [{ evalType: String, label: String, restrict: String }],

	// 底下開始是文章真正的資料
	"articleContent": [ { evalType: String, body: String, label: String } ]
};

// 用來儲存板主自定義，不該被文章作者（任意）修改到的東西
const article_info_schema_t = {
	"article": { type: ObjectId, required: true },
	// 一些橫跨全看板的功能？
	// 匿名性：0代表實名，1代表匿名但本人可見，2代表根本沒儲存留言的人是誰
	"anonymous": { type: Number, default: 0 },
	// 推文
	"push": { type: Number, default: 0 },
};

const comment_schema_t = {
	"article": { type: ObjectId, required: true },
	"date": { type: Date, required: true },
	"author": String,
	"commentContent": [{ evalType: String, body: String, label: String }]
};

const user_schema_t = {
	// id 例如 infinitycity5566
	"id": { type: String, index: true },
	"password": { type: String, required: true },
	"salt": { type: String, required: true },
};

let board_schema = new Schema(board_schema_t);
let Board = mongoose.model("Board", board_schema);
let article_schema = new Schema(article_schema_t);
let Article = mongoose.model("Article", article_schema);
let comment_schema = new Schema(comment_schema_t);
let Comment = mongoose.model("Comment", comment_schema);
let user_schema = new Schema(user_schema_t);
let User = mongoose.model("User", user_schema);
let article_info_schema = new Schema(article_info_schema_t);
let ArticleInfo = mongoose.model("ArticleInfo", article_info_schema);

module.exports = {
	Board,
	Article,
	Comment,
	ArticleInfo,
	User,
};
