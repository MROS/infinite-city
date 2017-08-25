# 無限城

無限城是個可編程的論壇，文章、留言的內容可撰寫函式，亦能以函式限制內容，發文、進入看板等等權限也可以編寫函式的方式進行管理。

## 使用

請參考

- [指南](https://github.com/MROS/infinite-city/blob/master/doc/%E6%8C%87%E5%8D%97.md)
- [參考手冊](https://github.com/MROS/infinite-city/blob/master/doc/%E5%8F%83%E8%80%83%E6%89%8B%E5%86%8A.md)
- [教學影片](https://www.youtube.com/playlist?list=PLOGStDKzeLpHQWLKtazy3AYqOD6ExnJsP)

指南會從最簡單的功能開始一步一步帶領讀者建立看板與文章，建議新手閱讀。

參考手冊則偏向查詢功能，當瞭解基本概念後，參數、繼承規則等等細節可在此找到。

教學影片基本上是以指南爲腳本拍攝的，但深度較爲不足，若想瞭解更多，請再回頭看文字教學。

## 建置

### 基礎依賴

無限城依賴於以下軟體，請在執行後續程序前先行安裝它們，已附上官網網址

- [MongoDB](https://www.mongodb.com/)
- [Redis](https://redis.io/)
- [Node.js](https://nodejs.org)(高於等於 v7.10)
- [Yarn](https://yarnpkg.com)

### 修改設定檔

``` sh
# 灌入 mailgun 的金鑰（向持有金鑰的開發者索取）
echo "module.exports = \"[金鑰內容]\";" > src/util/mail_api_key.js

# 設定 SESSION_SECRECT_KEY（必要）、伺服器開啓埠口、 MongoDB 位址、Redis 位址
vim src/config.js

# 設定根看板（可只依照預設值）
vim src/root_config.js
```

### 新增根看板

``` sh
env=[test|dev|production] yarn dbtool    # 灌入根看板設定到 MongoDB
```

### 安裝並編譯套件

``` sh
# 安裝並編譯前端
cd frontend
yarn                        # 安裝前端套件
yarn build                  # 編譯前端
yarn build:prod             # 編譯前端（縮小醜化）
# 安裝後端
cd ..
yarn                        # 安裝後端套件
```

### 啓動

``` sh
yarn start
```

也提供另個 npm script 一次安裝、編譯、並以 production 環境啓動

``` sh
yarn deploy:first          # 用於第一次部屬
yarn deploy                # pm2 裡若有記錄可用此指令更新伺服器（restart）
```
