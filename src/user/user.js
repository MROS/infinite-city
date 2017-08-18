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

async function startVerify(email) {
	await db.UserVerification.remove({ email }).exec();
	let verify_info = await db.UserVerification.create({
		email: email,
		createdDate: new Date()
	});
	if(env != "test") { // 測試環境不用這麼麻煩喇
		await sendVerificationMail(verify_info._id, email);
	}
	return verify_info._id;
}

/**
 * @param {String} guid 
 * @return {String} 申請認證時用的 email，若為 null 代表 guid 錯誤或過時
 */
async function getVerifyEmail(guid) {
	if(env == "test") {
		return `email${guid}@test.com`;
	}
	let deadline = new Date(new Date() - 60*60*1000); // 一小時內認證才算數
	try {
		let verify_info = await db.UserVerification.findOne({
			_id: guid,
			createdDate: { $gt: deadline }
		}).lean().exec();
		if (verify_info) {
			return verify_info.email;
		} else {
			return null;
		}
	} catch(err) {
		return null;
	}
}

async function deleteGUID(guid) {
	if(env == "test") {
		return;
	}
	try {
		let info = await db.UserVerification.findOneAndRemove({ _id: guid });
		if (!info) {
			throw `不存在的 guid: ${guid}`;
		}
	} catch (err) {
		throw `不合法的 guid: ${guid}`;
	}
}

async function emailUsed(email) {
	let user = await db.User.findOne({ email }).lean().exec();
	return user ? true : false;
}

module.exports = {
	findUser, encrypt, encryptUser, startVerify, getVerifyEmail, emailUsed, deleteGUID
};