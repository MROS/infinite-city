let crypto = require("crypto");
let env = require("../config.js").env;

const db = require("../database.js");
const { sendVerificationMail } = require("../util/mail_util.js");

async function findUser(id) {
	let user = await db.User.findOne({ id }).exec();
	return user;
}

function encrypt(password, salt) {
	return crypto.pbkdf2Sync(password, salt, 4096, 256, "sha512").toString("hex");
}

function encryptUser(id, password) {
	return new Promise((resolve, reject) => {
		crypto.randomBytes(128, function (err, salt) {
			if (err) {
				reject(err);
			}
			salt = salt.toString("hex");
			password = encrypt(password, salt);
			resolve({ id, password, salt });
		});
	});
}

async function startVerify(user_id, email) {
	await db.UserVerification.remove({ userId: user_id }).exec();
	let verify_info = await db.UserVerification.create({
		userId: user_id,
		createdDate: new Date()
	});
	if(env != "test") { // 測試環境不用這麼麻煩喇
		await sendVerificationMail(user_id, verify_info._id, email);
	}
	return verify_info._id;
}

async function verify(user_id, guid) {
	if(env == "test") {
		return true;
	}
	let deadline = new Date(new Date() - 5*60*1000); // 五分鐘內認證才算數
	try {
		let verify_info = await db.UserVerification.findOneAndRemove({
			_id: guid,
			userId: user_id,
			createdDate: { $gt: deadline }
		}).lean().exec();
		if (verify_info) {
			return true;
		} else {
			return false;
		}
	} catch(err) {
		return false;
	}
}

async function emailUsed(email) {
	let user = await db.User.findOne({ email }).lean().exec();
	return user ? true : false;
}

module.exports = {
	findUser, encrypt, encryptUser, startVerify, verify, emailUsed
};