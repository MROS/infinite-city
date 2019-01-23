# API 標準
* api/user
	- POST api/user/start-verify
		+ { email }，為字串
		+ 回傳 "email 已被使用" 或 "不合法的 email" 或 "OK"
		+ 若回傳 OK 代表系統寄了註冊網址給該信箱
	- POST api/user/new
		+ { id, password, guid }，id 和 password 皆爲字串，例如 { id: "david0u0", password: "1234" }
			- guid 為認證碼，字串，須在生成的一小時內使用
		+ 返回 "ID 已被使用" 或 "認證碼錯誤或過期" 或 "OK" 或 "FAIL"
	- POST api/user/login
		+ { id, password }
		+ 返回 "帳號或密碼錯誤" 或 "OK" 或 "FAIL"
	- GET api/user/logout
		+ 無其他參數，返回 "OK" 或 "尚未登入"
	- GET api/user/who
		+ 返回 { login: bool, id: `${id名稱}` }
	- GET api/user/email-used?email=... api/user/id-used?id=...
		+ 為了即時前端回饋而有的 api，回傳 used/invalid/OK
* api/profile
	- GET api/profile?id=XXX
		+ 返回 200 { a_list }

* api/board
	- GET api/board/browse?base=?&max=?&name=?,?,?,...
		+ 從某個基準看板（base）開始，往下根據名字（可爲中文）查找看板
		+ 例如：api/board/browse?base=595cb098f549af236588f88d&max=50&name=運動類,中華職棒,爪爪板
		+ 帶參數 max，限制返回陣列最多可以多長，預設爲10
		+ 帶參數 base，爲亂碼 _id，預設爲根看板
		+ 返回根看板下的所有東西，{ b_list, a_list, board, authority }
		+ a_list 爲文章列表，b_list 爲看板列表，board 為查找的這個看板，authority 為使用者的權限
			- authority 中的資料如下，如果 ok == false，代表當前使用者無權進行該行動
				1. onNewArticle: { ok: boolean, msg: String }
				2. onNewBoard: { ok: boolean, msg: String }
	- POST api/board/new
		+ { name, parent, formRules, renderRules, backendRules }
		+ name: 字串，看板的名字，不可爲空字串
		+ parent: 字串，母看板的 id
		+ formRules: 鍵值對
			1. articleForm: [{ evalType, restrict, label }] evalType 爲 "string" 或 "function"、label 不得重複、restrict 需 eval 之後是函式(typeof 爲 'function')
			2. commentForm: [{ evalType, restrict, label }] evalType 爲 "string" 或 "function"、label 不得重複、restrict 需 eval 之後是函式(typeof 爲 'function')
		+ renderRules: 鍵值對
			1. renderTitle 字串，預設爲空字串，需 eval 之後是函式(typeof 爲 'function')
			2. renderArticleContent 字串，預設爲空字串，需 eval 之後是函式(typeof 爲 'function')
			3. renderComment 字串，預設爲空字串，需 eval 之後是函式(typeof 爲 'function')
		+ backendRules
			1. onEnter: [rule: String] 進入看板或文章時在後端做的檢查，需 eval 之後是函式(typeof 爲 'function')
			2. onNewBoard: [rule: String] 創子板時在後端做的檢查，需 eval 之後是函式(typeof 爲 'function')
			3. onNewArticle: [rule: String] 發文時在後端做的檢查，需 eval 之後是函式(typeof 爲 'function')
			4. onComment: [rule: String] 推文時在後端做的檢查，需 eval 之後是函式(typeof 爲 'function')
				* 舉例而言，一則推文必須經過 onComment 陣列中每個 rule 檢查，才能進入資料庫
		+ 返回的可能主要有兩種
			1. 狀態200，{ _id: String } 代表新建立看板的 id
			2. 狀態403與純字串的錯誤訊息，代表被板主定義的 onNewBoard 婊了（字串也是板主客製的）
* api/article
	- PUT api/article?id=?
		+ { title, articleContent }
		+ 返回 { ok: boolean, msg: String }
	- POST api/article/new
		+ { title, board, articleContent, formRules, renderRules, backendRules }
		+ title: 字串，文章標題，不可爲空字串
		+ board: 字串，看板的 id
		+ articleContent: [{ body, label }]
		+ formRules: 鍵值對
			1. commentForm: [{ evalType, restrict, label }] evalType 爲 "string" 或 "function"、label 不得重複、restrict 需 eval 之後是函式(typeof 爲 'function')
		+ renderRules: 鍵值對
			1. renderComment 字串，根據母看板的權限，可能不被允許設定，需 eval 之後是函式(typeof 爲 'function')
		+ backendRules: 鍵值對
			1. onEnter [String]，需 eval 之後是函式(typeof 爲 'function')
			2. onComment [String]，需 eval 之後是函式(typeof 爲 'function')
		+ 返回的可能主要有兩種
			1. 狀態200，返回 { _id: String } 代表新文章的 id
			2. 狀態403與純字串的錯誤訊息，代表被板主定義的 onNewArticle 婊了（字串也是板主客製的）
	- GET api/article/browse?base=?&name=?,?,?,...&id=?&max=?
		+ 從某個基準看板（base）開始，往下根據名字（可爲中文）查找看板
		+ 例如：api/board/browse?base=595cb098f549af236588f88d&max=50&name=運動類,中華職棒,爪爪板&id=5498as845e4156er6115w88d
		+ 帶參數 base，爲亂碼 _id，預設爲根看板
		+ 帶參數 max 限制回傳的推文數
		+ 返回一篇文章 
			1. id: String
			2. title: String
			3. createdDate
			4. lastUpdatedDate
			5. author: String
			6. renderComment: String
			7. renderArticleContent: String
			8. articleContent: [String]
			9. commentForm: [Object]
			10. comment: [Object]
			11. authority 中的資料如下，如果 ok == false，代表當前使用者無權進行該行動
				1. onComment: { ok: boolean, msg: String }
			12. board [Object]
* api/comment
	- POST api/comment/new
		+ { article, commentContent }
		+ commentContent: 陣列，每個元素的構成為 { body, label }
			1. body: string 推文的內容
			2. label: string 推文的標籤
		+ commentContent 必須以和 commentForm 相同的順序傳入
		+ 返回的可能主要有兩種
			1. 狀態200，{ _id: String } 代表新推文的 id
			2. 狀態403與純字串的錯誤訊息，代表被板主定義的 onComment 婊了（字串也是板主客製的）