# API 標準
* api/user
	- POST api/user/new
		+ { id, password }，id 和 password 皆爲字串，例如 { id: "david0u0", password: "1234" }
		+ 返回 "ID 已被使用" 或 "OK" 或 "FAIL"
	- POST api/user/login
		+ { id, password }
	- GET api/user/logout
		+ 無其他參數，返回 "OK" 或 "尚未登入"
* api/board
	- GET api/board/rootlist
		+ 帶參數 max，限制返回陣列最多可以多長
		+ 返回根看板下的所有東西，{ b_list, a_list }，兩者皆爲陣列
		+ a_list 爲文章列表， b_list 爲看板列表
	- GET api/board/list/:board
		+ 帶參數 max
		+ 返回 :board 底下所有東西，{ b_list, a_list }
	- POST api/board/new
		+ { name, mather, rules }
		+ name: 字串，看板的名字
		+ mather: 字串，母看板的 id
		+ rules: 鍵值對
			1. allowDefineTitle: boolean，預設爲真
			2. allowDefineContent: boolean，預設爲真
			3. allowDefineForm: boolean，預設爲真
			4. allowDefineComment: boolean，預設爲真
			5. renderTitle 字串，預設爲 null
			6. renderContent  字串，預設爲 null
			7. renderCommentForm 字串，預設爲 null
			8. renderComment  字串，預設爲 null
			9. 1~8 根據母看板的權限，可能不被允許設定
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
		+ 返回 OK
* api/rule
	- GET api/rule/article/:article
		+ 沿着看板鏈上溯，最多到根看板，尋找 :article 這篇文章的所有渲染規則
		+ 返回 { renderTitle, renderContent, renderCommentForm, renderComment }
			- 四個皆爲字串
	- GET api/rule/board/:board
		+ 尋沿着看板鏈上溯，找 :board 這個看板的所有渲染規則
