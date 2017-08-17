# 無限城

## 建置

安裝 mongodb 、redis

``` sh
# 先啓動 mongodb 伺服器、redis 伺服器
vim src/root_config.js      # 根看板相關設定，包含渲染函數等等
node src/db_tools.js        # 灌入根看板設定到 mongodb
vim src/util/mail_api_key.js# 設定 mailgun 的金鑰
cd frontend
yarn                        # 安裝前端套件
yarn build                  # 編譯前端
cd ..
yarn                        # 安裝後端套件
yarn start                  # 啓動伺服器
```
