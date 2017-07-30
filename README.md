# 無限城

## 建置

``` sh
# 先啓動 mongodb 伺服器
node src/add_root_board.js  # 灌入根看板設定到 mongodb
cd frontend
yarn                        # 安裝前端套件
yarn build                  # 編譯前端
cd ..
yarn                        # 安裝後端套件
yarn start                  # 啓動伺服器
```
