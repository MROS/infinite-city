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
		+ 返回根看板下的所有東西，{ b_list, a_list, board_id }
		+ a_list 爲文章列表， b_list 爲看板列表，board_id 爲此看板的亂碼 _id
	- GET api/board/list/:board?max=
		+ 帶參數 max
		+ 返回 :board 底下所有東西，{ b_list, a_list, board_id }
	- POST api/board/new
		+ { name, parent, formRules, renderRules, backendRules }
		+ name: 字串，看板的名字
		+ parent: 字串，母看板的 id
		+ formRules: 鍵值對
			1. articleForm
			2. commentForm
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
			1. onEnterBoard: [rule: String] 進入看板時在後端做的檢查
			2. onEnterArticle: [rule: String] 進入文章時在後端做的檢查
			3. onNewBoard: [rule: String] 創子板時在後端做的檢查
			4. onNewArticle: [rule: String] 發文時在後端做的檢查
			5. onComment: [rule: String] 推文時在後端做的檢查
				* 舉例而言，一則推文必須經過 onComment 陣列中每個 rule 檢查，才能進入資料庫
		+ 返回 OK
* api/article
	- POST api/article/new
		+ { title, board, articleContent, formRules, renderRules, backendRules }
		+ title: 字串，文章標題
		+ board: 字串，看板的 id
		+ articleContent: [String]，每個元素可能是靜態字串，也可能是轉成字串的函數
			- 如果其成員是函數，就是一個無參數並返回字串的函數
		+ formRules: 鍵值對
			1. commentForm: [Object]，規範每個表格
		+ renderRules: 鍵值對
			1. renderComment 字串，根據母看板的權限，可能不被允許設定
		+ backendRules: 鍵值對
			1. onEnterArticle [String]
			2. onComment [String]
		+ 返回 OK
* api/rule
	- GET api/rule/article/:article
		+ 沿着看板鏈上溯，最多到根看板，尋找 :article 這篇文章的所有渲染規則
		+ 返回 { renderTitle, renderArticleContent, renderComment }
			- 四個皆爲字串
	- GET api/rule/board/:board
		+ 尋沿着看板鏈上溯，找 :board 這個看板的所有渲染規則
