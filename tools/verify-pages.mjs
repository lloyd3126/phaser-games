import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, join, resolve, sep } from "node:path";

const rootDir = resolve(import.meta.dirname, "..");
const gamesDir = join(rootDir, "games");
const outputDir = join(rootDir, "pages-dist");
const siteRoot = "/phaser-games/";

const walk = (directory) => readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
  const path = join(directory, entry.name);
  return entry.isDirectory() ? walk(path) : [path];
});

const requireFile = (path, label) => {
  if (!existsSync(path) || !statSync(path).isFile()) {
    throw new Error(`${label} is missing: ${path}`);
  }
};

requireFile(join(outputDir, "index.html"), "Pages homepage");
requireFile(join(outputDir, "404.html"), "Pages 404 page");
requireFile(join(outputDir, ".nojekyll"), "Pages .nojekyll marker");
requireFile(join(outputDir, "assets", "site.css"), "Compiled site styles");
requireFile(join(outputDir, "assets", "site.js"), "Bundled site script");

if (existsSync(join(outputDir, "games.json"))) {
  throw new Error("Legacy games.json must not be published.");
}
for (const legacyAsset of ["catalog-search.js", "styles.css"]) {
  if (existsSync(join(outputDir, legacyAsset))) {
    throw new Error(`Legacy ${legacyAsset} must not be published.`);
  }
}

const gameSlugs = readdirSync(gamesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && existsSync(join(gamesDir, entry.name, "game.json")))
  .map((entry) => entry.name)
  .sort();
const homepage = readFileSync(join(outputDir, "index.html"), "utf8");
if (!homepage.includes('data-game-search-input') || !homepage.includes('src="assets/site.js"')) {
  throw new Error("Pages homepage is missing the game search feature.");
}

for (const slug of gameSlugs) {
  const gamePath = join(outputDir, "games", slug, "index.html");
  requireFile(gamePath, `${slug} game page`);

  if (existsSync(join(outputDir, "games", slug, "play"))) {
    throw new Error(`${slug} legacy play directory must not be published.`);
  }

  const occurrences = homepage.split(`data-game-slug="${slug}"`).length - 1;
  if (occurrences !== 1) {
    throw new Error(`Homepage must contain exactly one ${slug} card; found ${occurrences}.`);
  }
  const modalId = `game-modal-${slug}`;
  if (!homepage.includes(`id="${modalId}"`)) {
    throw new Error(`Homepage is missing the ${slug} game modal.`);
  }
  if (!homepage.includes(`data-bs-target="#${modalId}"`)) {
    throw new Error(`Homepage card is not connected to the ${slug} game modal.`);
  }
}

const searchTextCards = homepage.split('data-game-search-text="').length - 1;
if (searchTextCards !== gameSlugs.length) {
  throw new Error(`Homepage search data must cover every game; found ${searchTextCards} cards for ${gameSlugs.length} games.`);
}

const files = walk(outputDir);
const htmlFiles = files.filter((path) => extname(path) === ".html");
const publishedHtml = htmlFiles.map((path) => readFileSync(path, "utf8")).join("\n");
if (/cdn\.jsdelivr\.net\/npm\/bootstrap|bootstrap(?:\.bundle)?\.min\.(?:css|js)/.test(publishedHtml)) {
  throw new Error("Published HTML must use locally compiled Bootstrap assets.");
}
const missingLinks = [];
const rootAbsoluteLinks = [];

for (const htmlPath of htmlFiles) {
  const html = readFileSync(htmlPath, "utf8");
  const links = [...html.matchAll(/\b(?:href|src)="([^"]+)"/g)].map((match) => match[1]);

  for (const link of links) {
    if (/^(?:https?:|data:|mailto:|#)/.test(link)) continue;
    if (link.startsWith("/") && link !== siteRoot) {
      rootAbsoluteLinks.push(`${htmlPath}: ${link}`);
      continue;
    }
    if (link === siteRoot) continue;

    const cleanLink = decodeURIComponent(link.split(/[?#]/)[0]);
    if (!cleanLink) continue;
    let target = resolve(dirname(htmlPath), cleanLink);
    if (cleanLink.endsWith("/")) target = join(target, "index.html");
    if (!existsSync(target)) missingLinks.push(`${htmlPath}: ${link}`);
  }
}

if (rootAbsoluteLinks.length > 0) {
  throw new Error(`Root-absolute local links are not portable:\n${rootAbsoluteLinks.join("\n")}`);
}
if (missingLinks.length > 0) {
  throw new Error(`Broken local links:\n${missingLinks.join("\n")}`);
}

const runtimeDir = join(outputDir, "games", "starfall-intercept");
const mediaPrefix = `${join(runtimeDir, "media")}${sep}`;
const runtimeFiles = files.filter((path) => (
  path.startsWith(`${runtimeDir}${sep}`) && !path.startsWith(mediaPrefix)
));
const runtimeText = runtimeFiles
  .filter((path) => new Set([".html", ".css", ".js"]).has(extname(path).toLowerCase()))
  .map((path) => readFileSync(path, "utf8"))
  .join("\n");
const hasPngAsset = runtimeFiles.some((path) => extname(path).toLowerCase() === ".png")
  || runtimeText.includes("data:image/png;base64,");
if (!hasPngAsset) {
  throw new Error("starfall-intercept build is missing PNG assets.");
}
for (const extension of [".ogg", ".ttf"]) {
  if (!runtimeFiles.some((path) => extname(path).toLowerCase() === extension)) {
    throw new Error(`starfall-intercept build is missing ${extension} assets.`);
  }
}

console.log(`Verified ${htmlFiles.length} HTML pages and ${gameSlugs.length} published game.`);
