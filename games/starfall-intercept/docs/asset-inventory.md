# Starfall Intercept 素材盤點

## 盤點範圍與方法

- 遊戲名稱：**Starfall Intercept（星落截擊）**
- `gameSlug`：`starfall-intercept`
- 素材根目錄：`assets-source/kenney_space-shooter-remastered/`
- 盤點日期：2026-08-25
- 實際檔案：314 個內容檔，另有 2 個 macOS `.DS_Store` metadata 檔（不納入遊戲素材）。
- 本盤點以實際檔案內容為準：逐檔讀取檔案類型與圖片尺寸、以縮圖檢查各素材視覺內容、解析 `Spritesheet/sheet.xml`、讀取授權文字、以 `ffprobe` 讀取 OGG 音訊規格、以 `fc-scan` 讀取字型資訊。
- 表格中的檔名都以素材根目錄為相對路徑；若同一列先寫出資料夾（例如 `PNG/Enemies/`），後續同列的 basename 會與該資料夾直接組成實際路徑。`～` 只用來壓縮列舉已逐一存在的連號檔案，不代表額外或推測的檔案。

## 檔案總覽

| 類型 | 數量 | 實際內容 |
|---|---:|---|
| PNG | 301 | 背景、玩家船、敵機、UFO、隕石、雷射、船體零件、道具、特效、UI、預覽圖與 spritesheet |
| OGG Vorbis | 7 | 雷射、失敗、護盾、提示與 zap 音效；無音樂檔 |
| TTF | 2 | KenVector Future 字型與 Thin 字型 |
| XML | 1 | `sheet.png` 的 TextureAtlas frame 對照，294 個 `SubTexture` |
| SVG | 1 | 路徑型 vector 素材表，根節點未提供固定尺寸或 `viewBox` |
| SWF | 1 | 壓縮 Macromedia Flash 檔，版本 17；舊格式，遊戲 MVP 不依賴 |
| TXT | 1 | CC0 授權說明 `license.txt` |

所有遊戲物件 PNG（船、敵機、雷射、道具、特效、UI 等）實際上都有透明 alpha；四張背景、`preview.png` 與 `sample.png` 是不含 alpha 的 RGB 圖片。

## 授權與包裝檔

### `license.txt`

- 路徑：`assets-source/kenney_space-shooter-remastered/license.txt`
- 類型：ASCII plain text。
- 檔案內容可靠指出素材為 **Space Shooter (Remastered, plus fonts and sounds) by Kenney Vleugels**。
- 授權：**CC0**；文字明確表示可用於個人與商業專案，標註 Kenney 或 `www.kenney.nl` 為善意但非必要。
- 本遊戲規劃沿用這份授權；實作時仍保留 `license.txt`。

### `Spritesheet/sheet.png` 與 `Spritesheet/sheet.xml`

- `Spritesheet/sheet.png`：PNG、1024×1024、含 alpha、147,484 bytes。
- `Spritesheet/sheet.xml`：ASCII text；根節點為 `<TextureAtlas imagePath="sheet.png">`。
- XML 有 **294 個 `SubTexture`**。每一格均明確提供 `name`、`x`、`y`、`width`、`height`；沒有固定 grid 尺寸，也沒有 `frameWidth`、`frameHeight`、`frameX`、`frameY`、旋轉或動畫時間欄位。
- 294 個 `name` 都能在素材包的 PNG basename 找到；不在 atlas 的 PNG 是四張 `Backgrounds/*.png`、`preview.png`、`sample.png` 與 atlas 本身 `sheet.png`。
- 因此可以可靠使用 XML 做 atlas crop，但不能從 XML 推出任何動畫順序、播放速度或角色用途。這些均標記為「待確認／由遊戲設計決定」。

### `Vector/sheet.svg` 與 `Vector/sheet.swf`

- `Vector/sheet.svg`：SVG、約 500 KB；根 `<svg>` 只有 namespace，沒有固定 `width`、`height` 或 `viewBox`。檔案內實際有 1 個 `<svg>`、1,213 個 `<path>` 與多個 gradient 定義。它是路徑型素材表，不是已拆分的遊戲物件檔。
- `Vector/sheet.swf`：`Macromedia Flash data (compressed), version 17`。沒有可直接由現代 Phaser 4 素材流程可靠使用的 frame/動畫規格；相容性待確認，MVP 不使用。

## 背景、預覽與示例

### 背景

| 實際路徑 | 類型／尺寸 | 實際觀察 |
|---|---|---|
| `Backgrounds/black.png` | PNG、256×256、RGB、不含 alpha | 近黑色星空，少量淡星點 |
| `Backgrounds/blue.png` | PNG、256×256、RGB、不含 alpha | 深藍灰色星空，少量淡星點 |
| `Backgrounds/darkPurple.png` | PNG、256×256、RGB、不含 alpha | 深紫色星空，少量淡星點；最接近 `sample.png` 的場景色 |
| `Backgrounds/purple.png` | PNG、256×256、RGB、不含 alpha | 較亮的紫色星空，少量淡星點 |

檔案本身沒有標示 seamless/tileable；是否能無縫重複、如何捲動，**待確認**。MVP 應先當成靜態或經過實際接縫測試後再重複使用。

### 預覽與示例

| 實際路徑 | 類型／尺寸 | 實際內容與用途 |
|---|---|---|
| `preview.png` | PNG、736×678、RGB、不含 alpha | 一張素材總覽拼貼，含玩家船、敵機、隕石、雷射、道具、UI、零件與 Kenney/CC0 標誌；是參考圖，不應當作遊戲背景或可碰撞物件。 |
| `sample.png` | PNG、640×384、RGB、不含 alpha | 實際示例構圖：深紫星空、底部玩家船、綠色垂直雷射、上方敵機、棕色隕石、黃色閃電道具，以及左上生命／倍率樣式與右上分數。它可靠支持「固定畫面垂直射擊」方向，但不提供程式規則。 |

## 玩家船、損傷與生命 UI

### 玩家船

以下檔案都是獨立 PNG、含 alpha；同一數字是不同船體輪廓，同一色名是色彩變體。檔名沒有提供速度、生命、武器或操控差異。

| 實際路徑 | 實際檔案 | 尺寸 |
|---|---|---:|
| `PNG/playerShip1_blue.png`、`PNG/playerShip1_green.png`、`PNG/playerShip1_orange.png`、`PNG/playerShip1_red.png` | 4 個；緊湊雙翼／中央座艙外形 | 99×75 |
| `PNG/playerShip2_blue.png`、`PNG/playerShip2_green.png`、`PNG/playerShip2_orange.png`、`PNG/playerShip2_red.png` | 4 個；較寬、尖角較明顯的外形 | 112×75 |
| `PNG/playerShip3_blue.png`、`PNG/playerShip3_green.png`、`PNG/playerShip3_orange.png`、`PNG/playerShip3_red.png` | 4 個；中央三角形、平展翼面外形 | 98×75 |

MVP 選用 `PNG/playerShip1_blue.png`；其餘船型作為後續外觀或模式擴充，不在第一版假設不同數值。

### 損傷／碎片圖

這 9 個檔案不是完整船體的替代圖，而是棕色邊緣的碎片／損傷視覺；尺寸會隨碎片形狀變化。檔名的 `damage1`、`damage2`、`damage3` 可作為三段受損效果的候選名稱，但播放順序、每格時間、是否循環都未寫在檔案中，**待確認**。

| 船型 | 實際檔案與尺寸 |
|---|---|
| 1 | `PNG/Damage/playerShip1_damage1.png` 99×76；`playerShip1_damage2.png` 99×76；`playerShip1_damage3.png` 100×76 |
| 2 | `PNG/Damage/playerShip2_damage1.png` 111×76；`playerShip2_damage2.png` 112×76；`playerShip2_damage3.png` 112×76 |
| 3 | `PNG/Damage/playerShip3_damage1.png` 97×76；`playerShip3_damage2.png` 97×76；`playerShip3_damage3.png` 97×76 |

### 生命圖示

每個檔案都是獨立小船圖示，四種顏色各一套；視覺上對應三種玩家船型，但檔案沒有附帶 HUD 規則。

| 實際檔案集合 | 數量 | 尺寸 |
|---|---:|---:|
| `PNG/UI/playerLife1_blue.png`、`playerLife1_green.png`、`playerLife1_orange.png`、`playerLife1_red.png` | 4 | 33×26 |
| `PNG/UI/playerLife2_blue.png`、`playerLife2_green.png`、`playerLife2_orange.png`、`playerLife2_red.png` | 4 | 37×26 |
| `PNG/UI/playerLife3_blue.png`、`playerLife3_green.png`、`playerLife3_orange.png`、`playerLife3_red.png` | 4 | 32×26 |

## 敵人、UFO 與 Boss 狀態

### 敵機

`PNG/Enemies/` 實際有 20 個含 alpha 的敵機圖：5 種輪廓 × Black、Blue、Green、Red 4 種色彩。色彩本身沒有可靠的戰鬥數值或行為資訊；要賦予不同玩法，應以輪廓與明確的遊戲規則區分，而不是只把顏色當成不同敵人。

| 實際檔案 | 尺寸 | 視覺上可確認的內容 |
|---|---:|---|
| `PNG/Enemies/enemyBlack1.png`、`enemyBlue1.png`、`enemyGreen1.png`、`enemyRed1.png` | 93×84 | 兩側外伸的寬翼型 |
| `PNG/Enemies/enemyBlack2.png`、`enemyBlue2.png`、`enemyGreen2.png`、`enemyRed2.png` | 104×84 | 上窄下寬、中央艙體型 |
| `PNG/Enemies/enemyBlack3.png`、`enemyBlue3.png`、`enemyGreen3.png`、`enemyRed3.png` | 103×84 | 中央尖頭、兩側斜翼型 |
| `PNG/Enemies/enemyBlack4.png`、`enemyBlue4.png`、`enemyGreen4.png`、`enemyRed4.png` | 82×84 | 近似盾牌／厚框型 |
| `PNG/Enemies/enemyBlack5.png`、`enemyBlue5.png`、`enemyGreen5.png`、`enemyRed5.png` | 97×84 | 中央細長、兩側大翼型 |

目前沒有敵人行為、生命值、碰撞框、攻擊冷卻或死亡動畫資料。上述 5 輪廓只是可用視覺資源，不代表原包已定義 5 種敵人。

### UFO

| 實際路徑 | 尺寸 | 實際觀察 |
|---|---:|---|
| `PNG/ufoBlue.png`、`PNG/ufoGreen.png`、`PNG/ufoRed.png`、`PNG/ufoYellow.png` | 各 91×91、含 alpha | 四個圓形飛碟／艙口視覺。沒有 UFO 行為或用途 metadata；可作為特殊敵人、獎勵載具或後續 Boss 元件，MVP 不使用。 |

### Boss

沒有名為 Boss、boss、commander 或完整大型 Boss 的獨立素材。`PNG/Parts/` 有大量座艙、翼、砲、引擎、beam 與炮塔零件，但沒有組裝錨點、組裝圖或 Boss 行為。Boss 應列為後續擴充，不能在素材盤點中宣稱已存在。

## 雷射、武器與投射物

`PNG/Lasers/` 實際有 48 個含 alpha 的獨立 PNG：Blue、Green、Red 各 16 個。縮圖實際可見三種色系的細長／粗短垂直雷射，以及圓形、十字、X 形的撞擊／爆閃形狀；檔案沒有把「子彈」與「命中特效」寫成 metadata，也沒有動畫時間。

| 色系 | 實際檔案（檔名完整） | 尺寸依檔名順序 |
|---|---|---|
| Blue | `PNG/Lasers/laserBlue01.png`～`laserBlue16.png` | 01 9×54；02 13×37；03 9×37；04 13×37；05 9×37；06 13×37；07 9×37；08 48×46；09 48×46；10 37×37；11 38×37；12 13×57；13 9×57；14 13×57；15 9×57；16 13×54 |
| Green | `PNG/Lasers/laserGreen01.png`～`laserGreen16.png` | 01 37×38；02 13×57；03 9×57；04 13×37；05 9×37；06 13×57；07 9×57；08 13×37；09 9×37；10 13×54；11 9×54；12 13×37；13 9×37；14 48×46；15 48×46；16 37×37 |
| Red | `PNG/Lasers/laserRed01.png`～`laserRed16.png` | 01 9×54；02 13×37；03 9×37；04 13×37；05 9×37；06 13×37；07 9×37；08 48×46；09 48×46；10 37×36；11 37×37；12 13×57；13 9×57；14 13×57；15 9×57；16 13×54 |

為避免以檔名猜測用途，MVP 只固定挑一個已視覺確認為直向細長光束的綠色圖做玩家彈道，另一色作為敵方彈道候選；確切選哪一格、碰撞盒與傷害值是遊戲設計與 playtest 參數，不是素材原始規格。

## 隕石與障礙物

`PNG/Meteors/` 實際有 20 個含 alpha 的隕石：Brown 與 Grey 各 10 個。每個尺寸級距都有大、中、小、tiny 的不同輪廓；檔名與像素尺寸可靠，但耐久、速度、是否可摧毀未定義。

| 色系 | 實際檔案與尺寸 |
|---|---|
| Brown | `PNG/Meteors/meteorBrown_big1.png` 101×84；`big2.png` 120×98；`big3.png` 89×82；`big4.png` 98×96；`med1.png` 43×43；`med3.png` 45×40；`small1.png` 28×28；`small2.png` 29×26；`tiny1.png` 18×18；`tiny2.png` 16×15 |
| Grey | `PNG/Meteors/meteorGrey_big1.png` 101×84；`big2.png` 120×98；`big3.png` 89×82；`big4.png` 98×96；`med1.png` 43×43；`med2.png` 45×40；`small1.png` 28×28；`small2.png` 29×26；`tiny1.png` 18×18；`tiny2.png` 16×15 |

Grey 沒有 `med3`，Brown 沒有 `med2`；這是實際檔案差異，不補造缺少的檔案。MVP 可用大小差異做耐久／碰撞風險差異，但數值需由遊戲設計設定。

## 船體零件與可組裝素材

`PNG/Parts/` 實際有 94 個含 alpha 的零件。縮圖顯示它們可拼成船體或炮塔，但檔案沒有 anchor、層級、旋轉、組裝配方或動畫資料；因此「可組裝 Boss」是擴充方向，不是已存在的 Boss。

### beam、engine、gun、scratch、turret

| 實際檔案 | 尺寸 |
|---|---|
| `PNG/Parts/beam0.png`、`beam1.png`、`beam2.png`、`beam3.png`、`beam4.png`、`beam5.png`、`beam6.png` | 43×31；40×20；38×31；29×29；41×17；40×25；43×23 |
| `PNG/Parts/beamLong1.png`、`beamLong2.png` | 15×67；25×64 |
| `PNG/Parts/engine1.png`、`engine2.png`、`engine3.png`、`engine4.png`、`engine5.png` | 38×23；42×28；27×22；49×45；44×24 |
| `PNG/Parts/gun00.png`～`gun10.png` | 00 16×36；01 17×33；02 14×36；03 20×41；04 16×41；05 21×41；06 17×38；07 14×41；08 10×47；09 20×52；10 20×52 |
| `PNG/Parts/scratch1.png`、`scratch2.png`、`scratch3.png` | 21×16；21×16；16×12 |
| `PNG/Parts/turretBase_big.png`、`turretBase_small.png` | 41×41；26×26 |

### cockpit 零件

每一色有 8 個檔案；下列尺寸依 `_0` 到 `_7` 順序。

| 實際檔案集合 | 尺寸序列 |
|---|---|
| `PNG/Parts/cockpitBlue_0.png`～`cockpitBlue_7.png` | 51×75；40×40；42×56；60×61；47×67；48×75；42×67；41×71 |
| `PNG/Parts/cockpitGreen_0.png`～`cockpitGreen_7.png` | 51×75；40×40；42×56；60×61；47×67；42×67；41×71；48×75 |
| `PNG/Parts/cockpitRed_0.png`～`cockpitRed_7.png` | 51×75；40×40；42×56；60×61；47×67；48×75；42×67；41×71 |
| `PNG/Parts/cockpitYellow_0.png`～`cockpitYellow_7.png` | 40×40；60×61；47×67；48×75；42×67；41×71；42×56；51×75 |

### wing 零件

每一色有 8 個檔案；尺寸依 `_0` 到 `_7` 順序。

| 實際檔案集合 | 尺寸序列 |
|---|---|
| `PNG/Parts/wingBlue_0.png`～`wingBlue_7.png` | 45×78；37×72；26×84；51×75；42×80；51×69；42×74；43×83 |
| `PNG/Parts/wingGreen_0.png`～`wingGreen_7.png` | 45×78；37×72；26×84；51×75；42×80；51×69；42×74；43×83 |
| `PNG/Parts/wingRed_0.png`～`wingRed_7.png` | 26×84；37×72；51×75；42×80；51×69；42×74；43×83；45×78 |
| `PNG/Parts/wingYellow_0.png`～`wingYellow_7.png` | 45×78；37×72；26×84；51×75；42×80；51×69；42×74；43×83 |

## 特效與動畫候選

### 引擎火焰

| 實際路徑 | 尺寸 |
|---|---|
| `PNG/Effects/fire00.png` | 16×40 |
| `PNG/Effects/fire01.png`、`fire04.png`、`fire05.png`、`fire06.png`、`fire07.png`、`fire11.png`、`fire14.png`、`fire15.png`、`fire16.png` | 各 14×31 |
| `PNG/Effects/fire02.png`、`fire12.png` | 各 14×32 |
| `PNG/Effects/fire03.png`、`fire13.png` | 各 14×34 |
| `PNG/Effects/fire08.png`、`fire09.png`、`fire10.png` | 各 16×40 |
| `PNG/Effects/fire17.png` | 14×31 |
| `PNG/Effects/fire18.png`、`fire19.png` | 各 16×41 |

視覺上是藍、黃、橘色的火焰／尾焰片段；連續數字使 `fire00`～`fire19` 成為合理的動畫候選，但原始資料沒有 frame duration、anchor 或 loop 資訊，動畫速度與實際順序**待確認**。

### 護盾、速度與星光

| 實際路徑 | 尺寸 | 實際觀察 |
|---|---:|---|
| `PNG/Effects/shield1.png` | 133×108 | 半透明弧形護盾 |
| `PNG/Effects/shield2.png` | 143×119 | 較厚、較完整的弧形護盾 |
| `PNG/Effects/shield3.png` | 144×137 | 更大的弧／圓形護盾 |
| `PNG/Effects/speed.png` | 7×108 | 垂直速度線 |
| `PNG/Effects/star1.png`、`star2.png` | 各 25×24 | 白色十字／星形閃光 |
| `PNG/Effects/star3.png` | 24×24 | 較多尖角的白色星光 |

三個 shield 與三個 star 的檔名不包含狀態或播放時間；可以作為護盾強度、拾取回饋或命中特效的視覺狀態，但數值意義由遊戲設計定義。

## 道具與獎勵圖示

### 四色方形道具

下列 16 個檔案全部是 34×33 PNG、含 alpha：

- `PNG/Power-ups/powerupBlue.png`、`powerupBlue_bolt.png`、`powerupBlue_shield.png`、`powerupBlue_star.png`
- `PNG/Power-ups/powerupGreen.png`、`powerupGreen_bolt.png`、`powerupGreen_shield.png`、`powerupGreen_star.png`
- `PNG/Power-ups/powerupRed.png`、`powerupRed_bolt.png`、`powerupRed_shield.png`、`powerupRed_star.png`
- `PNG/Power-ups/powerupYellow.png`、`powerupYellow_bolt.png`、`powerupYellow_shield.png`、`powerupYellow_star.png`

實際視覺是四色圓角方塊；`_bolt`、`_shield`、`_star` 分別印有閃電、盾牌、星形圖案，無後設資料說明持續時間或效果量。無後綴版本是沒有中央圖案的色塊。

### 小型膠囊與金屬圖示

| 實際檔案 | 尺寸 | 實際觀察 |
|---|---:|---|
| `PNG/Power-ups/pill_blue.png`、`pill_green.png`、`pill_red.png`、`pill_yellow.png` | 各 22×21 | 四色膠囊／能量圖示 |
| `PNG/Power-ups/bold_silver.png`、`bolt_bronze.png`、`bolt_gold.png` | 各 19×30 | 閃電／長條型金屬圖示；`bold_silver` 為實際檔名 |
| `PNG/Power-ups/shield_bronze.png`、`shield_gold.png`、`shield_silver.png` | 各 30×30 | 三種金屬色盾牌 |
| `PNG/Power-ups/star_bronze.png`、`star_gold.png`、`star_silver.png` | 各 31×30 | 三種金屬色星星 |
| `PNG/Power-ups/things_bronze.png`、`things_gold.png`、`things_silver.png` | 各 32×32 | 三種金屬色條狀／物資圖示 |

顏色與圖案能可靠確認，但稀有度、分數、恢復生命或武器效果沒有由檔案定義；MVP 只使用 bolt 與 shield 兩種，其他作擴充。

## UI 圖片與文字資源

### UI PNG

| 實際檔案 | 數量／尺寸 | 實際內容 |
|---|---:|---|
| `PNG/UI/buttonBlue.png`、`buttonGreen.png`、`buttonRed.png`、`buttonYellow.png` | 4 個，各 222×39 | 四色長條按鈕底圖，沒有烘焙文字 |
| `PNG/UI/cursor.png` | 1 個，30×33 | 白灰色游標圖示 |
| `PNG/UI/numeral0.png`～`numeral9.png` | 10 個，各 19×19 | 白色像素風數字 |
| `PNG/UI/numeralX.png` | 1 個，17×17 | 白色 `X` 圖示，可接在生命數量旁 |

沒有現成分數面板、進度條、標籤文字或完整 HUD；可以用字型渲染文字，或用 numeral 圖檔拼出數字。`sample.png` 的 HUD 只是示例圖，不是獨立的 UI 版面檔。

### 字型

| 實際路徑 | 檔案類型 | `fc-scan` 實際資訊 |
|---|---|---|
| `Bonus/kenvector_future.ttf` | TrueType SFNT | Family `KenVector Future`；Style `Regular`；Full name `KenVector Future Regular` |
| `Bonus/kenvector_future_thin.ttf` | TrueType SFNT | Family `KenVector Future Thin`；Style `Regular`；Full name `KenVector Future Thin Regular` |

字型檔本身沒有提供語系支援清單；是否包含遊戲需要的中文字形，**待確認**。遊戲規劃中的 MVP 文字可先使用英文或數字，避免假設字型包含中文。

## 音效

所有音效位於 `Bonus/`，實際格式都是 OGG Vorbis、44,100 Hz。下列聲道與長度由音檔 metadata 讀取；語意取自檔名與現有素材用途，實際混音與觸發時機仍是遊戲設計。

| 實際路徑 | 格式 | 聲道 | 長度 | 合理候選用途 |
|---|---|---:|---:|---|
| `Bonus/sfx_laser1.ogg` | Vorbis | mono | 1.217868 s | 玩家射擊 |
| `Bonus/sfx_laser2.ogg` | Vorbis | mono | 1.200567 s | 第二種射擊／強化射擊 |
| `Bonus/sfx_lose.ogg` | Vorbis | mono | 0.654762 s | 遊戲失敗或 Game Over |
| `Bonus/sfx_shieldDown.ogg` | Vorbis | stereo | 0.412177 s | 護盾消耗／解除 |
| `Bonus/sfx_shieldUp.ogg` | Vorbis | stereo | 0.293152 s | 護盾取得 |
| `Bonus/sfx_twoTone.ogg` | Vorbis | mono | 1.466712 s | 波次完成／獎勵回饋 |
| `Bonus/sfx_zap.ogg` | Vorbis | mono | 0.911451 s | 命中、隕石或敵機受擊 |

素材包沒有 BGM、循環音樂或環境音；MVP 不加入音樂系統。

## 可以可靠支持的遊戲方向

1. **固定畫面垂直射擊（首選）**：`sample.png` 已展示底部玩家、上方敵機、垂直雷射、隕石與星空；現有投射物、敵機、隕石、道具、生命 UI、分數數字與音效可以直接形成完整閉環。
2. **全方向競技場生存**：玩家船、敵機、隕石與道具也能使用，但現有雷射大多是垂直長條，sample 也不是全方向構圖；需要額外設計瞄準、旋轉與敵人追蹤，複雜度更高。
3. **模組化 Boss 組裝遊戲**：`Parts` 很多，但沒有 anchor、組裝配方、Boss 本體或行為，實際碰撞與層級都要自行建立；不適合作為第一版核心。

因此選擇「固定畫面、分波次、垂直射擊」作為 Starfall Intercept 的核心方向。敵機行為、生命值、碰撞盒、道具效果、動畫時間與計分都是本遊戲要定義的規則，不冒充成素材包已提供的規格。

## 盤點結論與實作限制

- 有角色：3 種玩家船型與 4 色變體；沒有角色動畫 metadata。
- 有敵人：5 種敵機輪廓 × 4 色變體，另有 4 個 UFO；沒有敵人行為或 Boss。
- 有武器／投射物：48 個三色雷射與 94 個船體／武器零件；沒有射速、傷害、碰撞盒規格。
- 有障礙：20 個 Brown/Grey 隕石，尺寸從 tiny 到 big；沒有耐久或移動規格。
- 有道具：四色 bolt、shield、star 方塊、膠囊、金屬盾牌／星星／物資圖示；效果需由遊戲設計定義。
- 有特效：fire00～19、shield1～3、speed、star1～3；檔案可作動畫候選，但沒有播放時序。
- 有 UI：按鈕底圖、游標、0～9、X、三種生命圖示；沒有完整 HUD。
- 有音效與字型；沒有音樂。
- 有 atlas：1024×1024 PNG + XML 的 294 格精確 crop；不是均勻格狀 spritesheet。
- 沒有 tilemap、地圖檔、關卡 JSON、碰撞資料、動畫 JSON、Boss、存檔或劇情資料。
- 所有碰撞形狀、敵人數值、波次、動畫時序、道具持續時間與難度曲線都必須在遊戲實作／測試階段明確定義與調整。
