import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";

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
requireFile(join(outputDir, "catalog-search.js"), "Catalog search script");

const gameSlugs = readdirSync(gamesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && existsSync(join(gamesDir, entry.name, "game.json")))
  .map((entry) => entry.name)
  .sort();
const homepage = readFileSync(join(outputDir, "index.html"), "utf8");
if (!homepage.includes('data-game-search-input') || !homepage.includes('src="catalog-search.js"')) {
  throw new Error("Pages homepage is missing the game search feature.");
}

for (const slug of gameSlugs) {
  const detailPath = join(outputDir, "games", slug, "index.html");
  const playPath = join(outputDir, "games", slug, "play", "index.html");
  requireFile(detailPath, `${slug} detail page`);
  requireFile(playPath, `${slug} play page`);

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

const playFiles = files.filter((path) => path.includes(`${join("games", "starfall-intercept", "play")}`));
const playText = playFiles
  .filter((path) => new Set([".html", ".css", ".js"]).has(extname(path).toLowerCase()))
  .map((path) => readFileSync(path, "utf8"))
  .join("\n");
const hasPngAsset = playFiles.some((path) => extname(path).toLowerCase() === ".png")
  || playText.includes("data:image/png;base64,");
if (!hasPngAsset) {
  throw new Error("starfall-intercept build is missing PNG assets.");
}
for (const extension of [".ogg", ".ttf"]) {
  if (!playFiles.some((path) => extname(path).toLowerCase() === extension)) {
    throw new Error(`starfall-intercept build is missing ${extension} assets.`);
  }
}

console.log(`Verified ${htmlFiles.length} HTML pages and ${gameSlugs.length} published game.`);
