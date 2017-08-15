const Mailgun = require("mailgun-js");

const config = require("../config.js");
const mail_config = require("./mail_config.js");
const mailgun = new Mailgun({ apiKey: mail_config.api_key, domain: mail_config.domain });

function _generateVerificationMsg(user_id, guid) {
	let base_url = (() => {
		switch (config.env) {
			case "dev":
			case "test":
				return `http://localhost:${config.PORT}`;
			case "production":
				return  "http://city-of-infinity.com";
			default:
				throw `未知的環境：${config.env}`;
		}
	})();
	let url = `${base_url}/app/verification?guid=${guid}`;
	return `<h1>${user_id}，歡迎來到∞無限城∞！</h1>
	<p>恭喜你，即將成為全台最二社群網站的一員。立刻點擊下列網址開通你的帳號，開始享受你的無限人生吧！</p>
	<a href="${url}">${url}</a>
	<p>我們在巴比倫城的頂點等著你</p>
	<p>⚡雷帝 👁邪眼男敬上</p>`;
}

function sendVerificationMail(user_id, guid, email) {
	let data = {
		from: mail_config.from,
		to: email,
		subject: `${user_id}，歡迎來到∞無限城∞！`,
		html: _generateVerificationMsg(user_id, guid)
	};
	return new Promise(function(resolve, reject) {
		mailgun.messages().send(data, function (err, body) {
			if (err) {
				reject(err);
			} else {
				resolve(body);
			}
		});
	});
}

module.exports = {
	sendVerificationMail
};
