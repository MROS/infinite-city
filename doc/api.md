# API 標準
* api/user
	- POST api/user/new
		+ { id, password }，id 和 password 皆爲字串，例如 { id: "david0u0", password: "1234" }
		+ 返回 "ID 已被使用" 或 "OK" 或 "FAIL"
	- POST api/user/login
		+ { id, password }
	- GET api/user/logout
		+ 無其他參數，返回 "OK" 或 "尚未登入"
	- GET api/user/who
		+ 返回 { login: bool, id: `${id名稱}` }
* api/board
	- GET api/board/browse?base=?&max=?&name=?,?,?,...
		+ 從某個基準看板（base）開始，往下根據名字（可爲中文）查找看板
		+ 例如：api/board/browse?base=595cb098f549af236588f88d&max=50&name=運動類,中華職棒,爪爪板
		+ 帶參數 max，限制返回陣列最多可以多長，預設爲10
		+ 帶參數 base，爲亂碼 _id，預設爲根看板
		+ 返回根看板下的所有東西，{ b_list, a_list, board, forbidden }
		+ a_list 爲文章列表，b_list 爲看板列表，board 為查找的這個看板
			- board 中的資料如下
				1. name
				2. manager
				3. date
				4. renderTitle
				5. articleForm
			- forbidden 中的資料（可能）如下，如果有值，代表當前使用者無權進行該行動
				1. onNewArticle: String
				2. onNewBoard: String
	- POST api/board/new
		+ { name, parent, formRules, renderRules, backendRules }
		+ name: 字串，看板的名字
		+ parent: 字串，母看板的 id
		+ formRules: 鍵值對
			1. articleForm: [{ evalType, restrict, label }]
			2. commentForm: [{ evalType, restrict, label }]
			3. canDefArticleForm
			4. canDefCommentForm
		+ renderRules: 鍵值對
			1. renderTitle 字串，預設爲 null
			2. renderArticleContent 字串，預設爲 null
			3. renderComment 字串，預設爲 null
			4. canDefTitle: boolean，預設爲真
			5. canDefArticleContent: boolean，預設爲真
			6. canDefComment: boolean，預設爲真
				* 1~6 根據母看板的權限，可能不被允許設定
		+ backendRules
			1. onEnter: [rule: String] 進入看板或文章時在後端做的檢查
			2. onNewBoard: [rule: String] 創子板時在後端做的檢查
			3. onNewArticle: [rule: String] 發文時在後端做的檢查
			4. onComment: [rule: String] 推文時在後端做的檢查
				* 舉例而言，一則推文必須經過 onComment 陣列中每個 rule 檢查，才能進入資料庫
		+ 返回格式有二
			1. 純字串的錯誤訊息，代表被板主定義的 onNewBoard 婊了（字串也是板主客製的）
			2. { _id: String } 代表新建立看板的 id
* api/article
	- POST api/article/new
		+ { title, board, articleContent, formRules, renderRules, backendRules }
		+ title: 字串，文章標題
		+ board: 字串，看板的 id
		+ articleContent: [{ body, label }]
		+ formRules: 鍵值對
			1. commentForm
		+ renderRules: 鍵值對
			1. renderComment 字串，根據母看板的權限，可能不被允許設定
		+ backendRules: 鍵值對
			1. onEnter [String]
			2. onComment [String]
		+ 返回格式有二
			1. 純字串的錯誤訊息，代表被板主定義的 onNewArticle 婊了（字串也是板主客製的）
			2. { _id: String } 代表新建立文章的 id
	- GET api/article/browse?base=?&name=?,?,?,...&id=?&max=?
		+ 從某個基準看板（base）開始，往下根據名字（可爲中文）查找看板
		+ 例如：api/board/browse?base=595cb098f549af236588f88d&max=50&name=運動類,中華職棒,爪爪板&id=5498as845e4156er6115w88d
		+ 帶參數 base，爲亂碼 _id，預設爲根看板
		+ 帶參數 max 限制回傳的推文數
		+ 返回一篇文章 
			1. title: String
			2. date
			3. author: String
			4. renderComment: String
			5. renderArticleContent: String
			6. articleContent: [String]
			7. commentForm: [Object]
			8. comment: [Object]
			9. forbidden 其值（可能）如下，如果有值，代表當前使用者無權進行該行動
				- onComment: String
* api/comment
	- POST api/comment/new
		+ { article, commentContent }
		+ commentContent: 陣列，每個元素的構成為 { body, label }
			1. body: string 推文的內容
			2. label: string 推文的標籤
		+ commentContent 必須以和 commentForm 相宭的順序傳入