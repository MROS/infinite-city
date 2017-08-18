# 無限城

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
