const supertest_session = require("supertest-session");
const app = require("../src/app");
const db = require("../src/database.js");

const ROOT = require("../src/root_config.js");
const tester1 = { id: "測試者一號", password: "testtest" };
let env = require("optimist").argv.env || process.env.env || "dev";

async function clearDB() {
	await Promise.all([
		db.Article.remove({}),
		db.ArticleInfo.remove({}),
		db.Board.remove({}),
		db.Comment.remove({}),
		db.User.remove({}),
	]);
}

describe("測試 api", () => {
	let session = null;
	test("設定基本環境", async () => {
		session = supertest_session(app);
		if(env == "test" || env == "dev") {
			await clearDB();
		}
		await db.Board.create(ROOT);
		await session.post("/api/user/new").send(tester1).expect("OK");
		await session.get("/api/user/logout").expect("OK");
	});
	describe("測試 user api", () => {
		test("登入測試者一號", async () => {
			await session.post("/api/user/login").send(tester1).expect("OK");
			await session.get("/api/user/who").expect({ id: tester1.id, login: true });
		});
		test("重名的使用者不給注冊", async () => {
			await session.post("/api/user/new").send({ id: tester1.id, password: "2134" })
			.expect("ID 已被使用");
		});
	});
	describe("測試 board, article & comment api", () => {
		/**
		 * 建立這樣的結構
		 *        root
		 *      /      \
		 *     b1      b2 -----
		 *     ｜     / | \    |
		 *     a0    b3 b4 b5 a1
		 *            |
		 *           a2
		 */
		let bid_array = [];
		let aid_array = [];
		function defaultBoard(name, parent) {
			return {
				name: name,
				parent: parent,
				formRules: {},
				renderRules: {},
				backendRules: {}
			};
		};
		test("建立樹狀看板結構", async () => {
			let res = await session.get("/api/board/browse").expect(200);
			let _id = res.body.board._id;
			bid_array.push(_id);

			res = await session.post("/api/board/new").send(defaultBoard("b1", _id)).expect(200);
			bid_array.push(res.body._id);

			res = await session.post("/api/board/new").send(defaultBoard("b2", _id)).expect(200);
			_id = res.body._id;
			bid_array.push(res.body._id);

			res = await session.post("/api/board/new").send(defaultBoard("b3", _id)).expect(200);
			bid_array.push(res.body._id);
			res = await session.post("/api/board/new").send(defaultBoard("b4", _id)).expect(200);
			bid_array.push(res.body._id);
			res = await session.post("/api/board/new").send(defaultBoard("b5", _id)).expect(200);
			bid_array.push(res.body._id);

			res = await session.post("/api/board/new").send(defaultBoard("b5", _id))
			.expect("名字 b5 與其它看板重復");
		});

		function defaultArticle(title, board) {
			return {
				title: title,
				board: board,
				articleContent: [],
				formRules: {},
				renderRules: {},
				backendRules: {}
			};
		}
		test("建立文章", async () => {
			let res = await session.post("/api/article/new")
			.send(defaultArticle("a0", bid_array[1])).expect(200);
			aid_array.push(res.body._id);

			res = await session.post("/api/article/new")
			.send(defaultArticle("a1", bid_array[2])).expect(200);
			aid_array.push(res.body._id);

			res = await session.post("/api/article/new")
			.send(defaultArticle("a2", bid_array[3])).expect(200);
			aid_array.push(res.body._id);
		});
		test("瀏覽看板底下東西的功能", async() => {
			let res = await session.get("/api/board/browse").expect(200);
			let { a_list, b_list, board } = res.body;
			expect(board._id).toBe(bid_array[0]);
			// TODO:
		});
	});

});