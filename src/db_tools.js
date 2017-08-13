const readlineSync = require("readline-sync");
const db = require("./database.js");
const ROOT = require("./root_config.js");
let env = require("./config.js").env;

function clearConsole() {
	process.stdout.write("\033c");
}
function question(prompt="無限城 > ", upper=true) {
	if(upper) return readlineSync.question(prompt).trim().toUpperCase();
	else return readlineSync.question(prompt).trim();
}
function waitEnter() {
	question("請按 Enter 繼續");
}
function ynPrompt(prompt) {
	let yes = null;
	while(yes == null) {
		process.stdout.write(`${prompt} (Y/N) `);
		let ans = question("");
		switch(ans) {
			case "Y":
			case "YES":
				yes = true;
				break;
			case "N":
			case "NO":
				yes = false;
				break;
			default:
				console.log("請輸入 Y 或 N");
		}
	}
	return yes;
}
async function addRootDialog() {
	let res = null;
	try {
		res = await db.Board.findOne({ isRoot: true }).lean().exec();
	} catch (err) {
		console.log(err);
	}
	if(res) {
		let ans = ynPrompt("根看板已存在，是否需要覆寫（本來的資料將會遺失）？");
		if(!ans) return;
		else ROOT.manager = res.manager; // 以免覆寫掉板主名單
	}
	try {
		await db.Board.findOneAndUpdate({ isRoot: true }, ROOT, { upsert: true }).exec();
		console.log("成功加入根看板！");
	} catch(err) {
		console.log(err.message);
	}
	waitEnter();
}
async function addManagerDialog() {
	let root
	try {
		root = await db.Board.findOne({ isRoot: true }).lean().exec();
		if(!root) {
			console.log("尚未創立根看板！");
			waitEnter();
			return;
		}
	} catch(err) {
		console.log(err.message);
	}
	console.log("請一行一行輸入板主的帳號 （連續兩個空行即代表輸入完畢）");
	let serial_blank = 0;
	let list = [];
	while(serial_blank < 2) {
		let ans = question("帳號 > ", false);
		if(ans.length == 0) serial_blank++;
		else {
			serial_blank = 0;
			if(root.manager.includes(ans) || list.includes(ans)) {
				console.error(`${ans} 已在板主名單中！`)
			}
			else {
				let user = await db.User.findOne({ id: ans }).lean().exec();
				if (!user) console.error(`查無此帳號：${ans} ！`);
				else list.push(ans);
			}
		}
	}
	if(list.length == 0) console.log("無新增的板主！");
	else {
		process.stdout.write("新增板主名單：");
		for(let id of list) process.stdout.write(id + ", ");
		console.log("");
		let ans = ynPrompt(`確定要新增以上${list.length}位板主？`)
		if(ans) {
			try {
				await db.Board.findOneAndUpdate({ isRoot: true }, {
					$push: { "manager": { $each: list } }
				}).exec();
				console.log("新增成功！")
			} catch(err) {
				console.error(err.message);
			}
		}
	}
	waitEnter();
}
async function clearManagerDialog() {
	let root = await db.Board.findOne({ isRoot: true }).lean().exec();
	if (!root) {
		console.log("尚未創立根看板！");
		waitEnter();
		return;
	}
	process.stdout.write("當前板主名單：");
	for(let id of root.manager) process.stdout.write(id + ", ");
	console.log("");
	let ans = ynPrompt(`確定要清空${root.manager.length}位板主？`);
	if(ans) {
		try {
			await db.Board.findOneAndUpdate({ isRoot: true }, { manager: [] }).exec();
			console.log("成功清空板主名單！");
		} catch(err) {
			console.error(err.message);
		}
	}
	waitEnter();
}
const P_NAME = "infinite-city";
async function dropDBDialog() {
	let ans = "";
	if(env == "test") {
		ans = P_NAME;
	} else {
		ans = question(`請輸入專案的名稱(${P_NAME}) > `, false);
	}

	if (P_NAME != ans) {
		console.log("專案名稱錯誤！");
	} else {
		ans = ynPrompt("確定要清空整個資料庫？");
		if(ans) {
			try {
				await Promise.all([
					db.Article.remove({}),
					db.ArticleInfo.remove({}),
					db.Board.remove({}),
					db.Comment.remove({}),
					db.User.remove({}),
				]);
				console.log("成功清空資料庫！");
			} catch (err) {
				console.log(err.message);
			}
		}
	}
	waitEnter();
}

const [ QUIT, ADD_ROOT, ADD_MANAGER, CLEAR_MANAGER, DROP, HELP ] = [ "Q", "R", "M", "C", "D", "H" ];
const OPTIONS = `請從下列選擇欲執行的指令
	- 新增／修改根看板：${ADD_ROOT}
	- 新增根看板板主：${ADD_MANAGER}
	- 清空根看板板主名單：${CLEAR_MANAGER}
	- 清空資料庫：${DROP}
	- 結束程式：${QUIT}
	- 顯示這段訊息：${HELP}`;
async function main() {
	let ans = "";
	while(ans != QUIT) {
		clearConsole();
		console.log(OPTIONS);
		do {
			ans = question();
			if (ans.length != 0) {
				if (ans == QUIT) break;
				else if (ans == ADD_ROOT) await addRootDialog();
				else if(ans == ADD_MANAGER) await addManagerDialog();
				else if(ans == CLEAR_MANAGER) await clearManagerDialog();
				else if(ans == HELP) break;
				else if(ans == DROP) await dropDBDialog();
				else {
					console.log("無此指令！");
					waitEnter();
				}
			}
		} while(ans.length == 0);
		console.log("");
	}
	process.exit(0);
}
main();