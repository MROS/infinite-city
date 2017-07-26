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
	- GET browse?base=?max=?name=?,?,?,...
		+ 從某個基準看板（base）開始，往下根據名字（可爲中文那個）查找看板
		+ 帶參數 max，限制返回陣列最多可以多長
		+ 帶參數 base，爲亂碼 _id，預設爲根看板
		+ 返回根看板下的所有東西，{ b_list, a_list, board_id }
		+ a_list 爲文章列表， b_list 爲看板列表，board_id 爲此看板的亂碼 _id
	- GET api/board/list/:board?max=
		+ 帶參數 max
		+ 返回 :board 底下所有東西，{ b_list, a_list, board_id }
	- POST api/board/new
		+ { name, parent, rules }
		+ name: 字串，看板的名字
		+ parent: 字串，母看板的 id
		+ rules: 鍵值對
			1. canDefTitle: boolean，預設爲真
			2. canDefContent: boolean，預設爲真
			3. canDefCommentForm: boolean，預設爲真
			4. canDefComment: boolean，預設爲真
			5. canDefArticleForm: boolean，預設爲真
			6. renderTitle 字串，預設爲 null
			7. renderContent 字串，預設爲 null
			8. renderCommentForm 字串，預設爲 null
			9. renderComment 字串，預設爲 null
			10. renderArticleForm  字串，預設爲 null
				* 1~10 根據母看板的權限，可能不被允許設定
			11. onEnterBoard: [{ mustObey: boolean, rule: String}] 進入看板時在後端做的檢查
			12. onNewBoard: [{ mustObey: boolean, rule: String}] 創子板時在後端做的檢查
			13. onPost: [{ mustObey: boolean, rule: String}] 發文時在後端做的檢查
			14. onComment: [{ mustObey: boolean, rule: String}] 推文時在後端做的檢查
				* 11~14 的 mustObey 意指子板或文章是否需要遵循相同標準
		+ 返回 OK
* api/article
	- POST api/article/new
		+ { title, board, content, commentForm, rules }
		+ title: 字串，文章標題
		+ board: 字串，看板的 id
		+ content: [String]，每個元素可能是靜態字串，也可能是轉成字串的函數
			- 如果 content 的成員是函數，就是一個無參數並返回字串的函數
		+ commentForm: [Object]，規範每個表格
		+ rules: 鍵值對
			1. renderContent 字串，根據母看板的權限，可能不被允許設定
			2. onComment [{ mustObey, rule }]
		+ 返回 OK
* api/rule
	- GET api/rule/article/:article
		+ 沿着看板鏈上溯，最多到根看板，尋找 :article 這篇文章的所有渲染規則
		+ 返回 { renderTitle, renderContent, renderCommentForm, renderComment, renderArticleForm }
			- 四個皆爲字串
	- GET api/rule/board/:board
		+ 尋沿着看板鏈上溯，找 :board 這個看板的所有渲染規則
