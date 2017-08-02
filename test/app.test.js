const supertest_session = require("supertest-session");
const app = require("../src/app");
const db = require("../src/database.js");
const mock = require("./mocks/api_mock.js");

const ROOT = require("../src/root_config.js");
const tester1 = { id: "測試者一號5566", password: "testtest" };
const tester2 = { id: "測試者二號5566", password: "testtest" };
const tester3 = { id: "測試者三號911", password: "testtest" };
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
function assertList(list, expected, key = "_id") {
	list = list.map(e => e[key]);
	expect(list).toEqual(expected);
}

describe("測試 api", () => {
	let session = null;
	test("設定基本環境", async () => {
		session = supertest_session(app);
		if(env == "test" || env == "dev") {
			await clearDB();
		}
		await db.Board.create(ROOT);
		await Promise.all([
			session.post("/api/user/new").send(tester1).expect("OK"),
			session.post("/api/user/new").send(tester2).expect("OK"),
			session.post("/api/user/new").send(tester3).expect("OK")
		]);
	});
	describe("測試 user api", () => {
		test("登入測試者一號", async () => {
			await session.post("/api/user/login").send(tester1).expect("OK");
			await session.get("/api/user/who").expect({ id: tester1.id, login: true });
			await session.get("/api/user/logout").expect("OK");
		});
		test("重名的使用者不給注冊", async () => {
			await session.post("/api/user/new").send({ id: tester1.id, password: "2134" })
			.expect("ID 已被使用");
		});
	});
	describe("測試 board, article & comment api", () => {
		/**
		 * 建立這樣的結構
		 *       _ root _             # root 不允許任何人發文
		 *      /        \
		 *     b1        b2 ___       # b2 只允許板主發文，b1 是56家族的私密看板
		 *   / |        / | \  \
		 *  a0 b6      b3 b4 b5 a1    # b3 b4 b5 的板主都是 tester2
		 *   |          |
		 *  c0         a2             # a2 的推文只能是「密碼+確認」
		 *              | \
		 *             c1 c2
		 */
		let bid_array = [];
		let aid_array = [];
		let cid_array = [];
		describe("測試不會被規則擋下的操作", () => {
			describe("測試建立的操作", () => {
				test("建立樹狀看板結構的功能", async () => {
					await session.post("/api/user/login").send(tester1).expect("OK");

					let res = await session.get("/api/board/browse").expect(200);
					expect(res.body).toHaveProperty("board");
					let _id = res.body.board._id;
					bid_array.push(_id);

					res = await session.post("/api/board/new").send(mock.b1(_id)).expect(200);
					expect(res.body).toHaveProperty("_id");
					bid_array.push(res.body._id);


					res = await session.post("/api/board/new").send(mock.b2(_id)).expect(200);
					expect(res.body).toHaveProperty("_id");
					_id = res.body._id;
					bid_array.push(res.body._id);

					// 切換使用者
					await session.post("/api/user/login").send(tester2).expect("OK");

					res = await session.post("/api/board/new").send(mock.b3(_id)).expect(200);
					expect(res.body).toHaveProperty("_id");
					bid_array.push(res.body._id);
					res = await session.post("/api/board/new").send(mock.b4(_id)).expect(200);
					expect(res.body).toHaveProperty("_id");
					bid_array.push(res.body._id);
					res = await session.post("/api/board/new").send(mock.b5(_id)).expect(200);
					expect(res.body).toHaveProperty("_id");
					bid_array.push(res.body._id);

					res = await session.post("/api/board/new").send(mock.b6(bid_array[1])).expect(200);
					expect(res.body).toHaveProperty("_id");
					bid_array.push(res.body._id);

					res = await session.post("/api/board/new").send(mock.b5(_id))
						.expect("名字 b5 與其它看板重復");
				});

				test("建立文章的功能", async () => {
					await session.post("/api/user/login").send(tester1).expect("OK");

					let res = await session.post("/api/article/new")
						.send(mock.a0(bid_array[1])).expect(200);
					expect(res.body).toHaveProperty("_id");
					aid_array.push(res.body._id);

					res = await session.post("/api/article/new")
						.send(mock.a1(bid_array[2])).expect(200);
					expect(res.body).toHaveProperty("_id");
					aid_array.push(res.body._id);

					res = await session.post("/api/article/new")
						.send(mock.a2(bid_array[3])).expect(200);
					expect(res.body).toHaveProperty("_id");
					aid_array.push(res.body._id);
				});

				test("推文功能", async () => {
					await session.post("/api/user/login").send(tester1).expect("OK");

					let res = await session.post("/api/comment/new")
						.send(mock.c0(aid_array[0])).expect(200);
					expect(res.body).toHaveProperty("_id");
					cid_array.push(res.body._id);

					res = await session.post("/api/comment/new")
						.send(mock.c1(aid_array[2])).expect(200);
					expect(res.body).toHaveProperty("_id");
					cid_array.push(res.body._id);

					res = await session.post("/api/comment/new")
						.send(mock.c2(aid_array[2])).expect(200);
					expect(res.body).toHaveProperty("_id");
					cid_array.push(res.body._id);
				});

			});
			describe("測試瀏覽的操作", () => {
				test("瀏覽看板底下東西的功能", async () => {
					let res = await session.get("/api/board/browse").expect(200);
					let { a_list, b_list, board } = res.body;
					expect(board._id).toBe(bid_array[0]);
					assertList(a_list, []);
					assertList(b_list, [bid_array[1], bid_array[2]]);

					res = await session.get("/api/board/browse?name=b1").expect(200);
					({ a_list, b_list, board } = res.body);
					expect(board._id).toBe(bid_array[1]);
					assertList(a_list, [aid_array[0]]);
					assertList(b_list, [bid_array[6]]);

					res = await session.get("/api/board/browse?name=b2").expect(200);
					({ a_list, b_list, board } = res.body);
					expect(board._id).toBe(bid_array[2]);
					assertList(a_list, [aid_array[1]]);

					assertList(b_list, [bid_array[3], bid_array[4], bid_array[5]]);
					assertList(b_list, ["b3", "b4", "b5"], "name");

					res = await session.get("/api/board/browse?name=b2,b3").expect(200);
					({ a_list, b_list, board } = res.body);
					expect(board._id).toBe(bid_array[3]);
					assertList(a_list, ["a2"], "title");
					assertList(b_list, []);
				});
				test("瀏覽文章和推文的功能", async () => {
					let res = await session
					.get(`/api/article/browse?name=b2,b3&id=${aid_array[2]}`).expect(200);

					let article = res.body;
					expect(article._id).toBe(aid_array[2]);
					expect(article.title).toBe("a2");
					assertList(article.comment, [cid_array[1], cid_array[2]]);

					let c = article.comment[0];
					expect(c.commentContent[0].evalType).toBe("string");
				});
			});
		});

		describe("測試會被擋的操作", () => {
			describe("測試建立的操作", () => {
				test("用 onNewBoard 限制創板的功能", async () => {

				});
				test("用 onEnter 限制創板的功能", async () => {

				});

				test("用 onNewArticle 限制發文的功能", async () => {
					await session.post("/api/article/new")
						.send(mock.a0(bid_array[0])).expect("不可褻瀆無限城的根");

					await session.post("/api/user/login").send(tester2).expect("OK");

					await session.post("/api/article/new")
						.send(mock.a1(bid_array[2])).expect("只有板主可在此發文");
				});
				test("用 articleForm 限制發文的功能", async () => {

				});
				test("用 onEnter 限制發文的功能", async () => {});

				test("用 onComment 限制推文的功能", async () => {

				});
				test("用 commentForm 限制推文的功能", async () => {
					await session.post("/api/comment/new")
						.send(mock.cx0(aid_array[2])).expect("未通過表格的限制");

					await session.post("/api/comment/new")
						.send(mock.cx1(aid_array[2])).expect("內文和表格長度不匹配");

					await session.post("/api/comment/new")
						.send(mock.cx2(aid_array[2])).expect("標籤不統一 fuck =/= valid");
				});
				test("用 onEnter 限制推文的功能", async () => {});
			});
			describe("測試瀏覽的操作", () => {
				// TODO:
				test("用 onEnter 限制瀏覽看板的功能", async () => {
					await session.get("/api/user/logout").expect("OK");
					await session.get("/api/board/browse?name=b1").expect("56家族請先登入");
					await session.post("/api/user/login").send(tester3).expect("OK");
					await session.get("/api/board/browse?name=b1").expect("非56家族不得進入");
					// 繼承而來的限制
					await session.get("/api/board/browse?name=b1,b6").expect("非56家族不得進入");
				});
				test("用 onEnter 限制瀏覽文章的功能", async () => {
					await session.post("/api/user/login").send(tester3).expect("OK");
					await session.get(`/api/article/browse?name=b1&id=${aid_array[0]}`).expect("非56家族不得進入");
				});
			});
		});
	});

});