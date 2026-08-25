# Starfall Intercept（星落截擊）Phaser.js 技術實作方案

## 1. 文件定位

- 遊戲名稱：**Starfall Intercept（星落截擊）**
- `gameSlug`：`starfall-intercept`
- 本文件用途：把既有的 [遊戲設計](./game-design.md) 轉成可以直接進入開發的 Phaser.js MVP 實作方案。
- 素材事實來源：[素材盤點](./asset-inventory.md) 與 `assets-source/kenney_space-shooter-remastered/`。
- 本階段只規劃，不建立 Phaser 專案、不複製素材、不產生完整遊戲程式。

### 不可自行改變的設計決定

1. 核心玩法維持為固定畫面的 2D 垂直分波射擊：玩家左右移動、持續向上射擊、閃避由上方進入的敵人、敵方雷射與隕石。
2. MVP 是固定三波，遊戲畫面以 640×384 為邏輯尺寸。
3. MVP 只支援桌面鍵盤：左右方向鍵或 A/D 移動，Space 持續射擊，Enter 開始或重新開始。
4. 玩家、Scout、Gunner、三種棕色隕石、兩種 power-up、玩家與敵方雷射是已確定的主要遊戲元素。
5. 不加入 Boss、商店、技能樹、貨幣、劇情、存檔、多人、隨機關卡、觸控、手把、滑鼠瞄準或背景音樂。
6. `assets-source/` 永遠是唯讀原始素材來源；正式遊戲素材只複製到本遊戲自己的 `assets/`，不覆蓋或移動來源檔案。

## 2. 根據實際素材得到的技術結論

目前素材包實際包含 314 個內容檔：301 張 PNG、7 個 OGG、2 個 TTF、1 個 XML、1 個 SVG、1 個 SWF 與 1 個授權 TXT；另有 2 個 `.DS_Store` metadata 檔不納入遊戲。

MVP 應優先使用獨立 PNG，而不是直接依賴整張 spritesheet。原因是：

- 主要角色、敵人、雷射、隕石與道具都已經有可直接載入的獨立 PNG，路徑與尺寸已核對。
- `Spritesheet/sheet.png` 是 1024×1024 的非固定格狀圖，搭配 `sheet.xml` 有 294 個具名 `SubTexture`；XML 提供每個 frame 的 `x`、`y`、`width`、`height`，但沒有統一 `frameWidth`、`frameHeight`、動畫時間或動畫順序。
- 因此它應使用 `load.atlasXML()`，不能用 `load.spritesheet()` 猜測格子大小，也不應在 MVP 為了少幾個 HTTP 請求而載入全部 294 個 frame。
- `sample.png` 只有參考構圖用途，不作遊戲背景；四張 256×256 背景沒有可靠標示為 seamless，MVP 不依賴無縫平鋪。
- 素材中沒有 tilemap、JSON 地圖、碰撞資料、動畫 metadata 或音樂檔，所以技術方案不建立 Tilemap、地圖載入器或 BGM 系統。

## 3. 技術基線與執行設定

### 3.1 建議工具鏈

- Phaser：Phaser 4，使用 ES modules。
- 開發伺服器與打包：Vite，遊戲目錄本身可作為 Vite root。
- 語言：JavaScript；MVP 不需要 TypeScript、React 或大型狀態管理套件。
- 物理：Arcade Physics。
- 渲染：`Phaser.AUTO`，讓 Phaser 依環境選擇 WebGL 或 Canvas。
- 素材路徑：以 `games/starfall-intercept/assets/` 為正式 URL 根目錄。

### 3.2 Phaser Game Config

`src/config/game-config.js` 應集中定義以下設定；不要把寬高、物理或輸入設定散落到各 Scene。

```js
{
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: '#050214',
  render: {
    antialias: true
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 640,
    height: 384
  },
  fps: {
    target: 60
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  input: {
    keyboard: true,
    mouse: false,
    touch: false,
    gamepad: false
  },
  scene: [PreloadScene, MenuScene, PlayScene]
}
```

上面是技術設定草案，不是要在本階段直接建立的完整檔案。`pixelArt` 不開啟，因為實際素材是帶有平滑陰影與透明 alpha 的繪圖，不是像素風格。

### 3.3 顯示與縮放

- 邏輯畫面固定 640×384，維持 5:3 比例。
- 使用 `FIT` 保留比例，畫面不足處使用 letterbox；使用 `CENTER_BOTH` 置中。
- `game-container` 需要有明確的 `width: 100vw`、`height: 100vh`、`overflow: hidden` 與深色背景，否則 Scale Manager 沒有可靠的父層尺寸。
- 不直接用 CSS 覆蓋 Phaser canvas 的寬高；讓 Scale Manager 控制 canvas 的 display size。
- 沒有相機捲動需求，使用主相機固定在 640×384，HUD 物件設 `setScrollFactor(0)` 作為防禦性設定。
- MVP 背景先將 `darkPurple.png` 以 `Image` 拉伸至 640×384。若實作時確認四邊可無縫銜接，才可改用 `TileSprite` 或雙層慢速捲動；這不是 MVP 必要條件。

## 4. 專案目錄與檔案責任

正式開發時建立的目錄應保持小而直接：

```text
games/starfall-intercept/
├── index.html
├── package.json
├── assets/
│   ├── backgrounds/
│   ├── ships/
│   ├── enemies/
│   ├── projectiles/
│   ├── meteors/
│   ├── powerups/
│   ├── effects/
│   ├── ui/
│   ├── audio/
│   ├── fonts/
│   ├── atlas/
│   └── license.txt
├── src/
│   ├── main.js
│   ├── config/
│   │   ├── game-config.js
│   │   └── game-constants.js
│   ├── data/
│   │   ├── assets.js
│   │   └── waves.js
│   ├── scenes/
│   │   ├── PreloadScene.js
│   │   ├── MenuScene.js
│   │   └── PlayScene.js
│   ├── ui/
│   │   └── Hud.js
│   └── styles/
│       └── game.css
└── docs/
    ├── asset-inventory.md
    ├── game-design.md
    └── technical-design.md
```

### 檔案責任

| 檔案 | 責任 | 不應放入的內容 |
|---|---|---|
| `index.html` | 提供 `#game-container` 與載入 `src/main.js` | 遊戲規則、波次資料 |
| `src/main.js` | 建立 Phaser Game，注入 Scene 陣列 | 玩家、敵人或碰撞邏輯 |
| `src/config/game-config.js` | Phaser config、渲染、Scale、Arcade Physics、輸入開關 | 波次與分數 |
| `src/config/game-constants.js` | 邏輯尺寸、速度、冷卻、生命、傷害等單一數值 | 素材 URL 對照 |
| `src/data/assets.js` | 正式 asset key 與正式 URL 對照 | 產生 Game Object |
| `src/data/waves.js` | 三波固定組成、生成順序、初始 x 位置與 drop 設定 | 物理 callback |
| `PreloadScene.js` | 載入 MVP 素材、載入進度、載入錯誤顯示 | 遊戲玩法 |
| `MenuScene.js` | 標題、操作提示、Enter 開始 | 敵人與碰撞 |
| `PlayScene.js` | 一局遊戲的本地狀態、玩家、群組、生成、輸入、碰撞、勝負 | 跨遊戲的大型資料庫 |
| `Hud.js` | 分數、生命、波次、結果文字的建立與更新 | 物理物件與敵人 AI |
| `game.css` | container、`@font-face`、頁面與 fallback 字型 | Phaser state |

MVP 不拆出 `EnemyManager`、`ProjectileManager`、`StateStore` 或 ECS。`PlayScene` 內的命名方法與 Physics Group 足以容納三波內容；只有當波次或敵人種類增加到影響可讀性時，才把生成方法抽成獨立模組。

## 5. Scene 設計與切換

### 5.1 只有三個 Scene

#### `PreloadScene`

- 遊戲啟動後唯一自動開始的 Scene。
- `preload()` 建立簡單的 Graphics 進度條與英文字進度文字，並載入所有 MVP 圖片、音效。
- `create()` 移除進度 UI，切換到 `MenuScene`。
- 不建立獨立 `BootScene`：MVP 沒有需要在載入前顯示的 logo、設定檔或遠端服務。

#### `MenuScene`

- `create()` 顯示靜態背景、遊戲標題、`A/D or ARROWS: MOVE`、`SPACE: FIRE`、`PRESS ENTER TO START`。
- 只監聽 Enter；不要在這裡載入或建立玩家與敵人。
- Enter 後 `this.scene.start('PlayScene')`。

#### `PlayScene`

- 包含整局遊戲，內部以 `phase` 表示 `running`、`waveClear`、`win`、`gameOver`。
- `create()` 建立背景、玩家、群組、碰撞、HUD、波次生成器與音效引用，然後開始第一波。
- `update()` 只處理持續輸入、玩家 x 位置、Gunner 的簡單橫移、護盾跟隨與離屏清理。
- Wave clear、Win、Game Over 都以 PlayScene 的 overlay 呈現，不建立無用途的 `WinScene` 或 `GameOverScene`。
- 結果畫面按 Enter 使用 `this.scene.restart()`，確保所有 Scene property、群組、Timer 與 HUD 都重新初始化。

### 5.2 Scene 生命週期與切換資料

| 轉移 | 觸發 | 傳遞資料 |
|---|---|---|
| `PreloadScene → MenuScene` | 載入完成 | 無；資源已在全域 Phaser cache |
| `MenuScene → PlayScene` | Enter | 無；每局從新狀態開始 |
| `PlayScene → PlayScene` | Win/Game Over 後 Enter | 無；`restart()` 重設整局 |

MVP 不使用 Phaser Registry，也不使用 Game-level global event bus 保存分數。分數、生命、波次與暫時效果都只屬於當前 `PlayScene`。這樣可以避免重開時殘留舊的分數、Timer 或 listener。若未來真的需要從結果畫面返回主選單，只傳遞 `{ score }` 即可，不必導入大型狀態管理。

## 6. 素材複製與 Phaser 載入規劃

### 6.1 複製規則

開發前的素材準備任務將下列來源檔案**複製**到目標路徑；來源路徑只讀，不刪除、不改名、不覆蓋：

`assets-source/kenney_space-shooter-remastered/` → `games/starfall-intercept/assets/`

正式遊戲不以 `../assets-source/...` 作 runtime URL，避免部署時依賴遊戲目錄外的來源資料。

### 6.2 MVP 圖片與 UI 素材

下表的尺寸是從實際檔案核對得到；顯示尺寸、碰撞盒與速度是實作參數，不是素材包內建規格。

| 實際來源路徑 | 正式目標路徑 | Phaser asset key | 載入方式 | 使用位置 | Game Object |
|---|---|---|---|---|---|
| `Backgrounds/darkPurple.png`（256×256 RGB） | `assets/backgrounds/darkPurple.png` | `bg.darkPurple` | `this.load.image` | PlayScene 全畫面背景 | `Image` |
| `PNG/playerShip1_blue.png`（99×75 RGBA） | `assets/ships/playerShip1_blue.png` | `ship.player.blue` | `this.load.image` | 玩家 | Arcade Physics `Sprite` |
| `PNG/Enemies/enemyBlue1.png`（93×84 RGBA） | `assets/enemies/enemyBlue1.png` | `enemy.scout.blue` | `this.load.image` | Scout | Arcade Physics `Sprite` |
| `PNG/Enemies/enemyGreen2.png`（104×84 RGBA） | `assets/enemies/enemyGreen2.png` | `enemy.gunner.green` | `this.load.image` | Gunner | Arcade Physics `Sprite` |
| `PNG/Lasers/laserGreen04.png`（13×37 RGBA） | `assets/projectiles/laserGreen04.png` | `projectile.laser.player` | `this.load.image` | 玩家向上雷射 | Physics Group 中的 Arcade Physics `Sprite` |
| `PNG/Lasers/laserRed04.png`（13×37 RGBA） | `assets/projectiles/laserRed04.png` | `projectile.laser.enemy` | `this.load.image` | Gunner 向下雷射 | Physics Group 中的 Arcade Physics `Sprite` |
| `PNG/Meteors/meteorBrown_small1.png`（28×28 RGBA） | `assets/meteors/meteorBrown_small1.png` | `meteor.brown.small` | `this.load.image` | 小型隕石 | Physics Group 中的 Arcade Physics `Sprite` |
| `PNG/Meteors/meteorBrown_med1.png`（43×43 RGBA） | `assets/meteors/meteorBrown_med1.png` | `meteor.brown.medium` | `this.load.image` | 中型隕石 | Physics Group 中的 Arcade Physics `Sprite` |
| `PNG/Meteors/meteorBrown_big1.png`（101×84 RGBA） | `assets/meteors/meteorBrown_big1.png` | `meteor.brown.big` | `this.load.image` | 大型隕石 | Physics Group 中的 Arcade Physics `Sprite` |
| `PNG/Power-ups/powerupBlue_bolt.png`（34×33 RGBA） | `assets/powerups/powerupBlue_bolt.png` | `powerup.bolt` | `this.load.image` | Rapid Fire 道具 | Physics Group 中的 Arcade Physics `Sprite` |
| `PNG/Power-ups/powerupBlue_shield.png`（34×33 RGBA） | `assets/powerups/powerupBlue_shield.png` | `powerup.shield` | `this.load.image` | Shield 道具 | Physics Group 中的 Arcade Physics `Sprite` |
| `PNG/Effects/shield1.png`（133×108 RGBA） | `assets/effects/shield1.png` | `fx.shield` | `this.load.image` | 玩家護盾視覺 | 非 Physics `Image` |
| `PNG/UI/playerLife1_blue.png`（33×26 RGBA） | `assets/ui/playerLife1_blue.png` | `ui.life.blue` | `this.load.image` | HUD 生命圖示 | `Image` |

生命數字、分數、波次與結果訊息使用 `Text`，不載入 `numeralX.png`。這讓生命值可以直接顯示 `LIVES: 3`，也避免為了數字圖集加入額外排版邏輯。

### 6.3 音效與字型

| 實際來源路徑 | 正式目標路徑 | Phaser key / 字型名稱 | 載入方式 | 觸發位置 | 備註 |
|---|---|---|---|---|---|
| `Bonus/sfx_laser1.ogg`（mono，44.1 kHz，約 1.218 秒） | `assets/audio/sfx_laser1.ogg` | `sfx.laser.player` | `this.load.audio` | 玩家射擊 | 使用低音量、fire-and-forget；若 HTML5 Audio 後端可設定多 instances |
| `Bonus/sfx_laser2.ogg`（mono，約 1.201 秒） | 不進 MVP 目標路徑 | `sfx.laser.alt` | 不載入 | 後續替代音效 | MVP 只有一種玩家雷射音效 |
| `Bonus/sfx_zap.ogg`（mono，約 0.911 秒） | `assets/audio/sfx_zap.ogg` | `sfx.zap` | `this.load.audio` | 敵人或隕石被擊破 | 用於命中/消滅回饋 |
| `Bonus/sfx_twoTone.ogg`（mono，約 1.467 秒） | `assets/audio/sfx_twoTone.ogg` | `sfx.twoTone` | `this.load.audio` | power-up 取得、波次完成 | 不作背景音樂 |
| `Bonus/sfx_shieldUp.ogg`（stereo，約 0.293 秒） | `assets/audio/sfx_shieldUp.ogg` | `sfx.shield.up` | `this.load.audio` | 取得 Shield | 播放一次 |
| `Bonus/sfx_shieldDown.ogg`（stereo，約 0.412 秒） | `assets/audio/sfx_shieldDown.ogg` | `sfx.shield.down` | `this.load.audio` | 護盾吸收傷害 | 播放一次 |
| `Bonus/sfx_lose.ogg`（mono，約 0.655 秒） | `assets/audio/sfx_lose.ogg` | `sfx.lose` | `this.load.audio` | Game Over | 播放一次 |
| `Bonus/kenvector_future.ttf`（TrueType Regular） | `assets/fonts/kenvector_future.ttf` | `"KenVector Future"` | `@font-face` | 所有英文 HUD/標題 | CSS 載入，不用 BitmapText |
| `Bonus/kenvector_future_thin.ttf`（TrueType Thin） | 不進 MVP 目標路徑 | `"KenVector Future Thin"` | 不載入 | 後續副標題 | 不需要兩套字型 |

實際素材只有 OGG，沒有 MP3/AAC/WebM fallback。技術上仍使用 `this.load.audio()`，但不宣稱跨瀏覽器都有聲音；音效不是勝負判定依賴，若某瀏覽器不支援 OGG，遊戲仍應可操作。瀏覽器的 autoplay policy 由 Phaser Sound Manager 處理，首次音效放在使用者按 Enter 或 Space 之後。

字型使用 `game.css` 的 `@font-face`。`Text` 需要瀏覽器字型先載入，不使用 `BitmapText`，因為素材包沒有 bitmap font 的 PNG/XML。MVP 文案使用英文與數字；目前無法從字型檔可靠確認中文字形覆蓋率，不在遊戲內直接依賴中文字。

### 6.4 XML atlas、動畫與未使用素材

| 實際來源 | 目標規劃 | Phaser key | 技術決定 |
|---|---|---|---|
| `Spritesheet/sheet.png`（1024×1024） | `assets/atlas/space-shooter-sheet.png` | `atlas.spaceShooter` | 後續可用 `this.load.atlasXML` |
| `Spritesheet/sheet.xml`（294 個 `SubTexture`） | `assets/atlas/space-shooter-sheet.xml` | 與上列共用 | XML 以具名、不等寬 frame 為準 |
| `PNG/Effects/fire00.png`～`fire19.png` | 不進 MVP | 待確認 | 是 20 張獨立 PNG，不是固定格 spritesheet；沒有可靠動畫時間、用途與播放順序，暫不建立動畫 |
| `PNG/Effects/shield2.png`、`shield3.png`、其他特效 | 不進 MVP | 待確認 | MVP 只用單張 `shield1.png` 靜態護盾 |
| `PNG/Parts/` | 不進 MVP | 無 | 沒有 anchor、組裝規格或 Boss 行為，不能自行拼裝 Boss |
| 其他 UFO、enemy3～5、playerShip2/3、其他雷射與道具 | 不進 MVP | 無 | 外觀存在不等於本玩法已定義用途 |
| `preview.png`、`sample.png` | 不進 runtime | 無 | 僅盤點/構圖參考 |
| `sheet.svg`、`sheet.swf` | 不進 runtime | 無 | 舊格式或非必要向量資源 |

如果後續確認需要 atlas，正確寫法是：

```js
this.load.atlasXML(
  'atlas.spaceShooter',
  'assets/atlas/space-shooter-sheet.png',
  'assets/atlas/space-shooter-sheet.xml'
);
```

這裡不能填 `frameWidth`、`frameHeight`，因為實際排列不是可靠的固定格。也不應用 `generateFrameNumbers()` 猜測動畫。只有在確認某組 frame 的用途與時間後，才用 XML frame name 建立 `generateFrameNames()` 動畫。

### 6.5 授權與部署檔

- `assets-source/kenney_space-shooter-remastered/license.txt` 實際指出素材為 Kenney 的 Space Shooter Remastered，授權為 CC0。
- 實作複製時保留到 `games/starfall-intercept/assets/license.txt`。
- 不把 `.DS_Store` 複製進正式 assets。

## 7. Game Object、Physics 與遊戲物件資料

### 7.1 PlayScene 物件持有方式

`PlayScene.create()` 建立以下屬性；每局由 Scene restart 全部重建：

```text
this.player                 Arcade Physics Sprite
this.playerBullets          Physics Group
this.enemyBullets           Physics Group
this.scouts                 Physics Group
this.gunners                Physics Group
this.meteors                Physics Group
this.powerups               Physics Group
this.shieldFx               Image
this.bottomExitZone         Zone + Static Arcade body
this.hud                    Hud helper
this.spawnTimer             TimerEvent | null
this.gunnerFireTimer        TimerEvent | null
this.waveAdvanceTimer       TimerEvent | null
```

不要把帶有 Physics body 的角色放進 `Container`；Container 會使物理 body 的座標與父子轉換變得難以維護。背景、HUD 與護盾視覺不需要 Physics，可使用 `Image` 或直接的 `Text`。

### 7.2 物件規格

| 元素 | Game Object / Group | 初始資料 | 物理與狀態 |
|---|---|---|---|
| 玩家 | `physics.add.sprite` | key `ship.player.blue`，初始 `(320, 332)` | `allowGravity=false`，只改 x；左右邊界限制；`lives=3` 由 Scene 保存 |
| 玩家雷射 | `physics.add.group` | key `projectile.laser.player` | 向上 `velocityY=-420`；集中管理、離開畫面即 disable；MVP 不預先配置 pool |
| Scout | `physics.add.group` | `hp=1`、`score=100`、直線下降 | `velocityY=90`；不發射、不橫移 |
| Gunner | `physics.add.group` | `hp=2`、`score=200` | 先下降到射擊區，再以小幅度水平速度往返；由 Scene Timer 定期射擊 |
| 敵方雷射 | `physics.add.group` | key `projectile.laser.enemy` | 向下 `velocityY=220`；集中管理、離開畫面即 disable；MVP 不預先配置 pool |
| 小棕隕石 | `physics.add.group` | `hp=1`、`score=25` | 向下約 105；可被玩家雷射擊破 |
| 中棕隕石 | `physics.add.group` | `hp=2`、`score=50` | 向下約 82；可被玩家雷射擊破 |
| 大棕隕石 | `physics.add.group` | `hp=3`、`score=75` | 向下約 60；可被玩家雷射擊破 |
| Bolt power-up | `physics.add.group` | `effect='bolt'` | 向下約 70；取得後 `rapidFireUntil = now + 6000` |
| Shield power-up | `physics.add.group` | `effect='shield'` | 向下約 70；取得後 `shieldActive=true` |
| 護盾視覺 | `Image` | key `fx.shield` | 無 body；visible 時每幀跟隨玩家位置；玩家受傷或效果結束時隱藏 |
| 底部威脅區 | `Zone` + Static body | 畫面底部外側約 y=394 | Scout、Gunner、隕石穿越時觸發玩家受傷並移除該威脅 |
| 背景 | `Image` | key `bg.darkPurple` | 靜態顯示 640×384，不參與 Physics |
| HUD | `Text` + `Image` | 分數、波次、生命圖示/文字 | 固定畫面，不參與 Physics |
| Boss | 不建立 Game Object | 素材包沒有可可靠確認的 Boss 本體或行為 | 不載入、不生成；保留為後續擴充 |

### 7.3 Physics 初始碰撞盒

下列不是素材檔案能確認的資訊，而是第一輪實作的**可調初始值**。需要在畫面上實測後調整；不要把透明 padding 當成可碰撞範圍。

| 物件 | source 尺寸 | 初始 body 建議 | 說明 |
|---|---:|---:|---|
| 玩家 | 99×75 | 60×42，置中 | 保留船翼透明區，讓擦邊較公平 |
| Scout | 93×84 | 58×50，置中 | 直向船體近似矩形 |
| Gunner | 104×84 | 64×50，置中 | 以中央船身為主 |
| 玩家/敵方雷射 | 13×37 | 6×24，置中 | 讓雷射命中判定不過寬 |
| 小隕石 | 28×28 | 半徑約 9 | 使用圓形 body |
| 中隕石 | 43×43 | 半徑約 15 | 使用圓形 body |
| 大隕石 | 101×84 | 約 70×58 | 先用矩形，必要時改成圓形近似 |
| Power-up | 34×33 | 24×24，置中 | 讓取得判定保留少量透明邊界 |

若使用 `setDisplaySize()` 改變任何物件顯示大小，必須在縮放後重新設定 `body.setSize()` 或 `body.setCircle()`，否則視覺與碰撞盒會不一致。

### 7.4 生命、傷害與無敵

- `lives` 初始 3；生命是 `PlayScene` property，不掛在玩家 sprite 的 data manager 內。
- 玩家與 Scout、Gunner、任一隕石、敵方雷射或底部威脅區 overlap 時呼叫同一個 `applyPlayerDamage(source)`。
- `shieldActive` 優先吸收下一次傷害：播放 `sfx.shield.down`、隱藏 `shieldFx`、不扣生命。
- 沒有護盾時若 `this.time.now < invulnerableUntil`，忽略重複 overlap。
- 有效受傷後扣 1 生命，將玩家回到畫面下方、設定約 1000ms 無敵，並以短暫 alpha 閃爍提供回饋。
- 生命降到 0 才進入 `gameOver`；未歸零的受傷不停止波次。
- 一次 collision callback 只處理一次傷害；被消滅的威脅立即 disable，避免同一個敵人重複扣血。

## 8. 玩家輸入與主要操作

### 8.1 Phaser Input API

`PlayScene.create()` 建立：

- `this.cursors = this.input.keyboard.createCursorKeys()`，實際使用 `left`、`right`、`space`。
- `this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A)`。
- `this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)`。
- `this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)`。
- `this.input.keyboard.addCapture(['LEFT', 'RIGHT', 'SPACE'])`，避免瀏覽器捲動或頁面快捷鍵干擾遊戲。

### 8.2 輸入行為

| 按鍵 | 行為 | API 使用 |
|---|---|---|
| Left / A | 向左移動 | `isDown` 持續輪詢 |
| Right / D | 向右移動 | `isDown` 持續輪詢 |
| Space | 持續射擊 | `isDown` 輪詢，加冷卻判定 |
| Enter | 開始、Win 後重開、Game Over 後重開 | `Phaser.Input.Keyboard.JustDown` |

持續移動與射擊放在 `update(time, delta)`，因為它們是連續輸入；Enter 這種一次性行為用 `JustDown` 或 keydown callback，避免按住 Enter 產生重複 restart。MVP 不註冊 pointer、touch、gamepad 或滑鼠事件。

## 9. 遊戲狀態、事件與資料流

### 9.1 Scene property

`PlayScene.init()` 每次進入或 restart 都要重設：

```text
phase = 'running' | 'waveClear' | 'win' | 'gameOver'
score = 0
lives = 3
waveIndex = 0
runElapsed = 0
rapidFireUntil = 0
shieldActive = false
playerInvulnerableUntil = 0
waveSpawnCursor = 0
remainingSpawnEntries = 0
```

另外保存 `spawnTimer`、`gunnerFireTimer`、`waveAdvanceTimer` 的引用，結束或 restart 時移除。當前敵人生命、分數與種類掛在各個 Physics Sprite 的簡單屬性上，例如 `threatType`、`hitPoints`、`scoreValue`、`strafeDirection`；不要為每個小物件建立獨立全域資料表。

### 9.2 事件名稱與觸發責任

事件使用 `PlayScene.events`，只作同一 Scene 內的低耦合通知；不建立跨遊戲的 global event bus。

| 事件 | 發生時機 | 主要處理 |
|---|---|---|
| `run-started` | PlayScene 建立第一波前 | HUD 顯示初始資料 |
| `wave-started` | 固定波次開始 | HUD 更新 `WAVE n`、清除前一波提示 |
| `player-fired` | 成功建立一發玩家雷射 | 播放低音量 `sfx.laser.player` |
| `enemy-hit` | 玩家雷射 overlap 敵人或隕石 | 扣 hp、命中回饋 |
| `threat-destroyed` | hp 歸零 | 加分、播放 zap、檢查是否清波 |
| `player-damaged` | 玩家有效受傷 | 更新生命、閃爍、必要時進 Game Over |
| `powerup-collected` | 玩家 overlap power-up | 套用效果、更新 HUD、播放音效 |
| `wave-cleared` | 生成完畢且所有威脅消失 | 顯示短暫清波文字並排程下一波 |
| `mission-won` | 第三波清除 | 停止生成、顯示勝利結果 |
| `game-over` | 生命降至 0 | 停止生成、顯示失敗結果、播放 lose |
| `run-restarted` | 結果畫面 Enter restart 後 | 驗證所有局部狀態回到初始值 |

事件 listener 必須使用具名方法與明確 context，並在 `Phaser.Scenes.Events.SHUTDOWN` 清理。不要在每次 restart 時添加不能移除的匿名 `on()` listener。

### 9.3 得分與進度

| 目標 | 分數 |
|---|---:|
| Scout | 100 |
| Gunner | 200 |
| 小隕石 | 25 |
| 中隕石 | 50 |
| 大隕石 | 75 |
| 清除一波 | 250 |
| 取得 power-up | 0 |

分數只在 `onThreatDestroyed` 與 `onWaveCleared` 修改；HUD 只接收更新後的整數，不自行計分。波次進度以固定資料中的 `spawnEntries`、目前活動威脅數與 `waveIndex` 表示，不用隨機 seed 或永久存檔。

## 10. 波次生成與簡單敵人 AI

### 10.1 固定波次資料

`src/data/waves.js` 只描述資料，不建立 Sprite：

| 波次 | 固定內容 | 行為目的 |
|---|---|---|
| 1 | 6 Scout + 2 小棕隕石 | 先理解移動、射擊與直線威脅；無敵方子彈 |
| 2 | 6 Scout + 2 Gunner + 2 小棕隕石 + 1 中棕隕石 + 1 Bolt | 引入會開火的敵機、較耐打障礙與 Rapid Fire 決策 |
| 3 | 8 Scout + 3 Gunner + 1 大棕隕石 + 2 中棕隕石 + 1 Shield | 提高密度與決策壓力；固定提供 Shield 測試路徑 |

波次中的 x 位置與生成順序用固定陣列明確寫入，避免每次遊戲出現不可重現的測試差異。初始生成間隔可使用約 450–600ms，之後以實測調整；這是節奏參數，不是素材規格。

MVP 實作固定在第二波提供 Bolt、第三波提供 Shield；道具從畫面上方下降，不計入清波所需的 threat 數量。這是為了讓兩種已定義的 power-up 都能在一局內被驗證，不引入隨機掉落或額外掉落系統。

### 10.2 WaveDirector 實作方式

不建立大型 manager class；在 `PlayScene` 以幾個具名方法管理：

1. `startWave(index)` 設定 `waveIndex`、`waveSpawnCursor`，發出 `wave-started`。
2. 第一個 entry 立即生成；其餘 entry 由 `spawnTimer = this.time.addEvent({ delay, repeat: entries.length - 2, callback: spawnNextEntry, callbackScope: this })` 生成。這是因為 Phaser 的 `repeat` 表示額外執行次數。
3. `spawnNextEntry()` 依 `type` 呼叫 `spawnThreat`；最後一次生成後停止或等待 Timer 完成。
4. 每個威脅被消滅或穿越底部時呼叫 `checkWaveCompletion()`。
5. 只有在 `spawnTimer` 已結束且 Scout/Gunner/Meteor 都沒有 active body 時，才進入 `waveClear`。
6. `waveClear` 使用一次性的 `this.time.delayedCall(700, advanceWave)`；第三波完成則進入 `win`。

Timer 的 `repeat` 是「額外重複次數」，因此 `entries.length - 1` 必須明確處理，避免多生成一個敵人。所有 Timer 都保存引用，結果狀態時 `remove()`。

### 10.3 敵人 AI

- Scout：只有向下速度，沒有額外 AI。碰到底部威脅區會造成傷害並 disable。
- Gunner：`state='enter'` 時向下移動；到達約 y=88–120 射擊區後改為 `state='strafe'`。`update()` 只維持簡單的左右往返速度，不做路徑搜尋或目標預測。
- Gunner 射擊：由一個 `gunnerFireTimer`（初始約每 1600ms）觸發，遍歷 active Gunner，在射擊區且未超出畫面時向下生成一發 `laserRed04`。Timer callback 不依賴每個 Gunner 自己持有多個 Timer，較容易在 restart 時清理。
- 隕石：只向下移動；不同尺寸只改變 hp、速度、分數與碰撞範圍，不能只有外觀不同。
- 所有 AI 都不需要 Path、Matter、行為樹或複雜有限狀態框架。

## 11. Physics、碰撞與 callback 分工

MVP 的物件互動都使用 `this.physics.add.overlap()`，因為玩家射擊、取得道具與受傷是觸發事件，不需要兩個物件互相推開。只有底部威脅區使用 static body；不建立需要分離推力的 `collider`。

### 必要 overlap

| overlap | callback | 結果 |
|---|---|---|
| `playerBullets × scouts` | `onPlayerBulletHitsThreat` | 扣 Scout hp；歸零即加 100 分並 disable |
| `playerBullets × gunners` | `onPlayerBulletHitsThreat` | 扣 Gunner hp；歸零即加 200 分並 disable |
| `playerBullets × meteors` | `onPlayerBulletHitsThreat` | 依隕石 hp 處理；歸零按尺寸得分 |
| `enemyBullets × player` | `onEnemyLaserHitsPlayer` → `applyPlayerDamage` | 護盾吸收或扣生命 |
| `scouts/gunners/meteors × player` | `onThreatHitsPlayer` → `applyPlayerDamage` | 護盾吸收或扣生命；威脅也應 disable |
| `powerups × player` | `onPowerupCollected` | disable、套用 Bolt 或 Shield |
| `scouts/gunners/meteors × bottomExitZone` | `onThreatEscaped` | 威脅造成一次傷害並 disable |

`onPlayerBulletHitsThreat` 每次 callback 先確認兩個 body 都 active，再以 data 讀取 hp。callback 完成後只在 hp 歸零時 disable body；同一發雷射與多個物件重疊的具體行為以第一輪測試結果決定，但初始設計是一發只處理第一個實際命中的威脅。

離屏清理是必要的低成本維護：`update()` 只掃描 bullets、enemy bullets 與不再可能回到畫面的 power-up，將 y 小於 -40 或大於 424 的 body `disableBody(true, true)`。敵人是否離開底部則由 `bottomExitZone` callback 處理，不以單純刪除代替傷害事件。

## 12. Power-up 行為

### Rapid Fire

- 素材：`powerupBlue_bolt.png`。
- 取得後設定 `rapidFireUntil = this.time.now + 6000`。
- 正常射擊冷卻初始約 260ms；Rapid Fire 初始約 100ms。
- `update()` 判斷 Space 持續按下與目前冷卻，實際建立雷射仍由 `tryFirePlayer()` 負責。
- 效果到期不需要額外 Timer；以 `this.time.now >= rapidFireUntil` 判定，HUD 可顯示 `RAPID` 或短暫提示。

### Shield

- 素材：`powerupBlue_shield.png`；視覺：`Effects/shield1.png`。
- 取得後 `shieldActive=true`、顯示 `shieldFx`、播放 `sfx.shield.up`。
- 下一次有效敵方雷射、敵人或隕石接觸由護盾吸收，設定 `shieldActive=false`、隱藏 `shieldFx`、播放 `sfx.shield.down`。
- 護盾不增加生命、不疊加層數；再次取得只維持一層。
- Bolt 與 Shield 的掉落由 `waves.js` 每波單一固定 `drop` 設定控制；MVP 目前固定為第二波 Bolt、第三波 Shield。正常 MVP 一局各只掉落一次，不增加隨機掉落或獨立掉落系統。

## 13. `preload()`、`create()`、`update()` 與 callback 責任

### `PreloadScene.preload()`

1. 建立不依賴外部圖片的進度 Graphics 與英文進度文字。
2. 依 `src/data/assets.js` 逐一呼叫 `this.load.image()`、`this.load.audio()`。
3. 使用 `this.load.on('progress')` 更新進度條，使用 `loaderror` 顯示實際失敗 URL/key。
4. 不在 preload 階段建立 Physics、玩家、敵人或波次。
5. 字型由 CSS `@font-face` 載入；PreloadScene 不把 TTF 當成圖片或 BitmapFont。

### `PreloadScene.create()`

- 確認必要 texture/audio cache 存在。
- 移除進度 UI。
- `this.scene.start('MenuScene')`。

### `MenuScene.create()`

- 建立全畫面背景、標題、操作提示。
- 建立 Enter key 的一次性開始處理。
- 可以在 `this.events.once(Phaser.Scenes.Events.SHUTDOWN, ...)` 中移除輸入 listener；不要從 MenuScene 殘留 listener 影響 PlayScene。

### `PlayScene.init(data)`

- 只重設 Scene property；不在 constructor 保存局狀態。
- 接受資料參數但 MVP 不使用，保留未來從選單傳入難度的擴充點，不在本版導入難度選單。

### `PlayScene.create()`

依序完成：

1. 建立背景與固定的 HUD 深度。
2. 建立 Physics Groups 與底部 Zone。
3. 建立玩家並設定初始位置、body size、無重力與邊界。
4. 設定鍵盤按鍵。
5. 建立 `Hud`，註冊本 Scene 的自訂事件。
6. 設定所有 overlap callback。
7. 設定 Gunner fire timer 的引用。
8. 發出 `run-started`，呼叫 `startWave(1)`。
9. 註冊 `SHUTDOWN`，移除 Timer、輸入與外部 listener。

### `PlayScene.update(time, delta)`

只保留必要的每幀工作：

- 當 `phase === 'running'` 時讀取左右按鍵，設定玩家 x 速度。
- 只允許水平移動，將玩家 x clamp 在約 32 到 608。
- Space 按住時呼叫 `tryFirePlayer()`；冷卻以 `this.time.now` 比較。
- 更新 Gunner 的簡單 strafe 方向與玩家護盾 Image 位置。
- 清理離屏 bullets、enemy bullets、已失效 power-ups。
- 增加 `runElapsed`，只作本局顯示/測試，不改變波次規則。

不要在 update 中逐幀遍歷所有敵人來判斷碰撞、計分、生命或波次完成；這些由 Physics callback、Timer Event 或 Scene event 負責。

### 主要 callback

- `spawnNextEntry()`：Timer 生成一個固定波次項目。
- `fireEnemyVolley()`：Timer 檢查 active Gunner 並生成敵方雷射。
- `tryFirePlayer()`：輸入成功且冷卻完成時建立玩家雷射。
- `onPlayerBulletHitsThreat()`：處理 hp、消滅與得分。
- `applyPlayerDamage(source)`：集中處理護盾、無敵、生命與 Game Over。
- `onPowerupCollected()`：套用唯一一次 power-up 效果。
- `onThreatEscaped()`：底部漏怪造成傷害並移除威脅。
- `checkWaveCompletion()`：只在生成完成或威脅數變更後檢查清波。
- `finishWin()` / `finishGameOver()`：停止 Timer、鎖定輸入、顯示 overlay、播放一次結果音效。

## 14. HUD 與回饋

`Hud.js` 只負責顯示，不直接改變 `PlayScene.score` 或 `lives`。

### 固定顯示

- 左上：`SCORE: 000000`。
- 右上：`LIVES: 3` 搭配 `ui.life.blue` 小圖示；數字使用 Text。
- 上方中央：`WAVE 1/3`。
- 取得 Bolt 後短暫顯示 `RAPID FIRE`；Shield active 時顯示 `SHIELD` 或依護盾 Image 判斷。

### 結果 overlay

- Wave clear：`WAVE CLEAR`，約 700ms 後自動繼續，不等待額外按鍵。
- Win：`MISSION COMPLETE`、最終分數、`PRESS ENTER TO RESTART`。
- Game Over：`GAME OVER`、最終分數、`PRESS ENTER TO RESTART`。

結果文字用 `Text`、`fontFamily: 'KenVector Future'`、固定 origin；不用圖片按鈕。HUD 物件沒有 Physics，也不放入任何敵人 Group。

## 15. MVP 逐步實作與驗證任務

每個階段都要先通過自己的完成條件，再進入下一階段。每一步都只修改列出的主要檔案，不把未完成的擴充功能混入 MVP。

| 階段 | 實作目標 | 主要檔案 | 完成條件 | 最簡單驗證 |
|---|---|---|---|---|
| 1. 專案骨架 | 建立可啟動的 Phaser/Vite 頁面 | `package.json`、`index.html`、`src/main.js`、`src/config/game-config.js`、`src/styles/game.css` | 瀏覽器有 640×384 遊戲 canvas，畫面置中且無 console error | 啟動 dev server，確認不同視窗比例仍 FIT |
| 2. 素材目錄與 key | 複製 MVP 白名單素材並集中管理 URL | `assets/**`、`src/data/assets.js` | `assets-source` 沒被修改；所有目標檔案存在且大小/格式符合盤點 | 以 `find`/`file` 檢查目標檔，Network 無 404 |
| 3. Preload 與 Menu | 載入圖片/音效、顯示進度、Enter 開始 | `PreloadScene.js`、`MenuScene.js`、`src/styles/game.css` | 載入完成後進選單；英文標題與鍵位提示可讀 | 重新整理頁面，確認 progress → Menu → Enter |
| 4. Play shell | 顯示背景、玩家、HUD 初始值 | `PlayScene.js`、`Hud.js` | 進入 Play 後看到實際 `playerShip1_blue`、darkPurple 背景、SCORE/LIVES/WAVE | 截圖確認玩家位於底部，HUD 不隨畫面錯位 |
| 5. 玩家控制 | 實作左右移動與邊界 | `PlayScene.js`、`game-constants.js` | A/D 與左右鍵只改變 x，玩家不能離開畫面、不受重力落下 | 按住兩組按鍵測試左/右邊界 |
| 6. 玩家射擊 | 建立綠色雷射、冷卻與離屏回收 | `PlayScene.js`、`game-constants.js`、`assets.js` | Space 可連射；普通與 Rapid 冷卻不同；雷射使用 `laserGreen04` | 按住 Space 10 秒，確認不爆量、不留在畫外 |
| 7. Physics 與命中 | 啟用 Arcade Physics、群組與玩家雷射命中 | `PlayScene.js` | 無重力；body 尺寸合理；雷射 overlap callback 能扣 hp | 先用一隻 Scout，命中一次即消失並顯示分數 |
| 8. 三波威脅 | 實作 Scout、Gunner、三種隕石與固定波次 | `waves.js`、`PlayScene.js` | 三波內容與設計文件一致；Gunner 有簡單橫移與紅色敵方雷射 | 開發時加快 Timer，逐一確認每種 type、hp、score |
| 9. 受傷與 power-up | 完成底部漏怪、接觸、敵彈傷害、護盾、Rapid | `PlayScene.js`、`Hud.js`、音效 key | 生命從 3 正確扣除；護盾只吸收一次；Rapid 持續約 6 秒；無敵期防止連扣 | 用固定位置讓敵彈/隕石命中，逐項觀察 HUD 與音效 |
| 10. 波次、勝負與重開 | 完成清波、分數、Win、Game Over、Enter restart | `PlayScene.js`、`Hud.js`、`waves.js` | 第三波清除進 Win；生命歸零進 Game Over；結果按 Enter 是乾淨新局 | 完整跑通勝利與故意碰撞失敗兩條路徑，再各重開一次 |
| 11. 音效與可讀性 | 接上必要 OGG，調整音量與文字 | `PreloadScene.js`、`PlayScene.js`、`Hud.js`、`game.css` | 射擊、命中、power-up、護盾、失敗有回饋；無背景音樂依賴 | 第一次由 Enter 啟動，確認瀏覽器允許音效；測試 OGG 不支援時仍可玩 |
| 12. MVP QA | 清理重啟、路徑與畫面問題 | 上述所有檔案 | 無 404、無未清理 Timer/listener、無殘留敵人/分數、三波可重現 | DevTools Console/Network + 連續完成三局（勝利、失敗、重開） |

### 任務順序中的明確邊界

- 不在階段 1–12 中加入 Boss、UFO、額外敵機、商店、技能樹、隨機生成或手機操作。
- 不因 `sheet.xml` 存在就提前改用 atlas；先讓獨立 PNG 版本通關。
- 不因 `fire00`～`fire19` 存在就加入動畫；目前沒有可靠 timing 與用途定義。
- 不在 MVP 加入粒子系統。命中回饋先用 zap 音效、短暫 tint/alpha 或靜態素材，已足夠驗證核心循環。

## 16. MVP Done Criteria

以下全部成立，才算 `starfall-intercept` 的 Phaser MVP 完成：

### 啟動與載入

- 從 `games/starfall-intercept/index.html` 啟動後，PreloadScene 可顯示進度並進入 MenuScene。
- 遊戲 canvas 以 640×384 邏輯尺寸在不同桌面視窗中保持比例並置中。
- MVP 白名單素材都從 `games/starfall-intercept/assets/` 載入，沒有依賴 `assets-source` 的 runtime 相對路徑。
- DevTools Console 沒有未處理例外，Network 沒有必要素材 404。

### 玩家與核心攻擊

- 玩家確實顯示 `playerShip1_blue.png`，只能水平移動且不會超出左右邊界。
- 按住 Space 能發射實際的 `laserGreen04.png`；正常射擊有冷卻，不會每幀無限生成。
- 玩家雷射有 Physics body、能命中並消滅 Scout、Gunner 與三種棕色隕石；不同 hp 與分數確實造成玩法差異。

### 敵人、威脅與波次

- 第一波只包含 6 Scout 與 2 小隕石，玩家能在約 30 秒內理解移動、射擊、命中與閃避。
- 第二波加入 Gunner、敵方 `laserRed04.png` 與中隕石；Gunner 會簡單橫移並定期開火。
- 第三波包含 8 Scout、3 Gunner、大隕石與中隕石，密度比前兩波高但仍可用左右移動與射擊完成。
- 敵人或隕石穿越底部會造成一次傷害，不會安靜消失而讓玩家看不懂失血原因。

### 傷害、道具與回饋

- 玩家初始 3 lives；敵彈、敵人、隕石或漏怪都能扣生命，且約 1 秒無敵期會避免同一碰撞連扣。
- Shield 能吸收下一次有效傷害並顯示 `shield1.png` 視覺；吸收後護盾消失。
- Bolt 能讓射擊冷卻縮短約 6 秒；效果到期後恢復正常冷卻。
- 至少有一條固定波次路徑能取得 Bolt 或 Shield；另一種可由 `waves.js` 的單一 drop 設定替換測試，不需建立第二套掉落系統。
- 射擊、命中、power-up、護盾消耗與 Game Over 具有對應音效；沒有音效時核心操作仍正常。

### 勝負、分數與重新開始

- HUD 能持續顯示分數、生命與目前波次；分數符合已定義的敵人、隕石與清波數值。
- 清除第三波後進入 `MISSION COMPLETE`，顯示最終分數與 Enter restart 提示。
- 生命歸零後進入 `GAME OVER`，停止新敵人生成與敵方射擊，顯示最終分數與 Enter restart 提示。
- 在 Win 與 Game Over 各按一次 Enter，都能建立一個乾淨的新局：分數回 0、生命回 3、波次回 1、power-up/無敵狀態清除、舊敵人與 Timer 不重複。
- 連續重新開始不會產生倍增的輸入 listener、Gunner fire timer、音效或敵人。

### 範圍守則

MVP 不需要驗收 Boss、atlas runtime、火焰動畫、tilemap、BGM、觸控、手把或存檔。這些素材或功能即使存在於來源包，也不屬於本版本完成條件。

## 17. 最終一致性檢查

在開始寫遊戲程式前，實作者應再次確認：

1. `gameSlug` 仍是 `starfall-intercept`，所有新檔案都在 `games/starfall-intercept/`。
2. `asset-inventory.md` 與 `game-design.md` 沒有被新的技術推測覆蓋；若實際檔案改變，先更新技術映射再寫程式。
3. `assets-source/` 仍保留原始 zip 解壓後的完整內容，不在其中產生編輯、重命名或刪除。
4. `laserGreen04.png` 與 `laserRed04.png` 是本方案指定的實際雷射，不以相似檔名替換。
5. 沒有把 XML atlas 當固定格 spritesheet，也沒有填入無法從檔案確認的動畫 frame 尺寸或時間。
6. 所有碰撞盒、速度、冷卻、無敵時間與生成間隔都在程式常數中集中管理，並標記為可 playtest 調整的設計參數。
7. 下一個開發提示可以直接依第 15 節由階段 1 開始實作，而不需要重新選 Scene、核心素材或 MVP 順序。
