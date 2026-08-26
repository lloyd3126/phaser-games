# Phaser Games

這是一個用來建立與管理多個 Phaser 遊戲的工作區。每個遊戲放在 `games/` 下並維持獨立的程式碼、依賴與素材；Codex 可透過工作區內的 Phaser 與 Kenney skills 協助開發。

## 目前狀態

- `games/starfall-intercept/` 是目前的 Phaser 遊戲範例與學生起始專案。
- `assets-source/` 是本機原始素材暫存區；其中的素材包會被 Git 忽略，只保留 `.gitkeep`。
- 遊戲實際使用的素材放在各遊戲自己的 `assets/` 目錄，會隨遊戲一起管理。
- Kenney 搜尋 Skill 不需要原始素材包即可使用。

## 目錄結構

```text
phaser-games/
├── games/                       每個遊戲的獨立專案
│   └── starfall-intercept/      目前的學生起始專案
├── lessons/                     課程單元、作業與評分規準
├── shared/                      跨遊戲共用的程式或整理後素材
├── assets-source/               本機原始素材暫存區，內容不提交 Git
├── .agents/skills/
│   ├── kenney-assets-search-skills/
│   ├── educational-game-ideation/
│   └── <phaser-skill>/
└── skills-lock.json             已安裝 Phaser skills 的來源與版本資訊
```

## 建立新遊戲

在 `games/` 中使用 [Phaser 官方建立工具](https://github.com/phaserjs/create-game)：

```bash
cd games
npm create @phaserjs/game@latest <game-name>
```

建立完成後進入遊戲目錄，依該模板產生的 README 安裝依賴並啟動開發環境。每個遊戲應保留自己的 `package.json`、原始碼與素材目錄。

## 學生快速開始

以目前的起始專案為例：

```bash
cd games/starfall-intercept
npm ci
npm run dev
```

瀏覽器開啟終端機顯示的本機網址即可開始。提交前可以執行：

```bash
npm test
npm run build
```

## 工作區原則

- 每個 `games/<game-name>/` 都是獨立遊戲專案。
- 遊戲實際使用的素材放在該遊戲的 `assets/`，只複製真正需要的檔案。
- 多個遊戲共用的程式或整理後素材放在 `shared/`。
- `assets-source/` 只作為本機暫存區，不讓遊戲直接依賴其中內容。
- Phaser Scene 用於單一遊戲內的選單、關卡與 UI；不同遊戲維持不同專案。

## Phaser Skills

`.agents/skills/` 內含 Phaser 4 開發 skills，涵蓋遊戲設定、Scenes、素材載入、Sprites、動畫、輸入、物理、Tilemaps、Particles、Tweens、Cameras、Graphics、Filters、音效與 Phaser 3 到 4 的遷移。

開發時直接描述需求即可，例如：

```text
幫我建立一個 Phaser 4 Scene，加入 Arcade Physics 玩家角色和鍵盤移動。
```

Codex 會依任務載入對應的 skill，不需要使用者先知道 skill 名稱。

## 教育遊戲發想

`educational-game-ideation` skill 會把學科主題或學習目標，組合成可測試的 2D 教育遊戲概念。它使用學習行為、玩家操作、世界規則、挑戰、隱性評量與回饋六類設計卡，協助比較方向並收斂成最小 Phaser 原型。

使用者可以直接從模糊題目開始，不需要知道卡牌名稱：

```text
我想做一款讓國中生理解供需關係的 2D 遊戲，帶我發想三個方向。
```

也可以要求檢查現有概念的學習與玩法是否真的整合：

```text
我有一款打怪後回答數學題的遊戲，幫我改成數學本身就是核心玩法。
```

## Kenney 素材搜尋

Kenney 搜尋 Skill 可以根據中文或自然語言需求推薦素材包、確認目前的官方頁面，並在要求時用內建瀏覽器開啟結果或將官方素材包下載到 `assets-source/`。

直接描述遊戲需求即可：

```text
幫我找適合像素風農場遊戲的角色、作物、地形和 UI 素材，找到後打開首選。
```

需要下載時必須明確提出：

```text
幫我找適合像素風農場遊戲的素材，確認首選後下載到 assets-source。
```

也可以要求比較或搜尋特定素材：

```text
比較適合太空射擊遊戲的 Kenney 素材包，列出主要素材與官方連結。
```

使用者不需要知道素材索引、英文搜尋詞或素材包名稱。Skill 內含搜尋所需的精簡參考資料，但最新狀態與網址仍以 [Kenney Assets 官網](https://kenney.nl/assets/)為準。只有使用者明確要求時才會下載；它不會自行捐款、購買、登入或加入收藏。

## 素材管理

需要實際使用素材時，可以要求 Kenney 搜尋 Skill 將官方 ZIP 保存到 `assets-source/`。預設保留原始壓縮檔且不解壓；只有明確要求時才會解壓到獨立素材包目錄。之後只將遊戲需要的檔案整理到對應的 `games/<game-name>/assets/`。`assets-source/` 的內容不會被 Git 追蹤，`assets-source/.gitkeep` 只用來保留空目錄。

## Git 管理

遊戲原始碼、遊戲實際使用的素材、文件與 lockfile 應提交到 Git。`node_modules/`、建置產物、快取、暫存素材與本機設定則由 `.gitignore` 排除。

## GitHub Pages 遊戲網站

這個 repository 會建置成一個靜態遊戲網站：根頁面列出所有遊戲，點擊遊戲卡片後會開啟介紹 Modal，Modal 中可以閱讀規則並直接進入 Phaser 遊戲。Bootstrap CSS 由 Sass 選擇性編譯，JavaScript 只打包 Modal，兩者都與網站一同發布，不依賴 CDN。網站只發布首頁、404 頁面與遊戲執行入口，不保留獨立介紹頁、`play/` 相容路徑或遊戲目錄 JSON。

```text
/
├── index.html
├── 404.html
└── games/
    └── <game-slug>/
        └── index.html  Phaser 遊戲
```

每個 `games/<game-slug>/` 都必須提供：

- `package.json` 中的 `build` 與 `test` 指令。
- `game.json`，包含遊戲名稱、簡介、規則與展示圖路徑。
- `presentation/cover.*` 遊戲封面。
- 可由 Vite 完整輸出到 `dist/` 的 runtime 素材；不要使用部署後會失效的網站根目錄絕對路徑。

在 workspace 根目錄執行完整驗證：

```bash
npm ci
npm run install:games
npm test
```

`npm test` 會測試所有遊戲、產生 `pages-dist/`，並驗證首頁、介紹頁、遊戲入口、內部連結與必要素材。推送到 `main` 後，`.github/workflows/deploy-pages.yml` 會自動將 `pages-dist/` 發布到 GitHub Pages。
