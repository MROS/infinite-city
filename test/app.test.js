const supertest = require("supertest");
const supertest_session = require("supertest-session");
const app = require("../src/app");
const db = require("../src/database.js");

const ROOT = require("../src/root_config.js");
const tester1 = { id: "測試者一號", password: "testtest" };

describe("測試 api", () => {
	let session = null;
	beforeAll(async () => {
		session = supertest_session(app);
		let p1 = db.Board.create(ROOT);
		let p2 = session.post("/api/user/new").send(tester1).expect("OK");
		await Promise.all([p1, p2]);
		await session.get("/api/user/logout").expect("OK");
	});
	beforeEach(() => {
		session = supertest_session(app);
	});

	describe("測測　user api", () => {
		test("登入測試者一號", async () => {
			await session.post("/api/user/login").send(tester1).expect("OK");
		});
		test("重名的使用者不給注冊", async () => {
			await session.post("/api/user/new").send({ id: tester1.id, password: "2134" })
			.expect("ID 已被使用");
		});
	});

});