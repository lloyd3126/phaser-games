import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { extname, join, resolve, sep } from "node:path";
import { spawnSync } from "node:child_process";
import { build as bundle } from "esbuild";
import * as sass from "sass";

const rootDir = resolve(import.meta.dirname, "..");
const gamesDir = join(rootDir, "games");
const siteDir = join(rootDir, "site");
const templatesDir = join(siteDir, "templates");
const outputDir = join(rootDir, "pages-dist");
const siteRoot = "/phaser-games/";

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const render = (template, values) => {
  const result = Object.entries(values).reduce(
    (html, [key, value]) => html.replaceAll(`{{${key}}}`, String(value)),
    template,
  );

  const unmatched = result.match(/{{[A-Z0-9_]+}}/g);
  if (unmatched) {
    throw new Error(`Unmatched template values: ${unmatched.join(", ")}`);
  }
  return result;
};

const requireText = (manifest, field, slug) => {
  if (typeof manifest[field] !== "string" || !manifest[field].trim()) {
    throw new Error(`${slug}/game.json must include a non-empty ${field}.`);
  }
};

const requireArray = (manifest, field, slug) => {
  if (!Array.isArray(manifest[field]) || manifest[field].length === 0) {
    throw new Error(`${slug}/game.json must include a non-empty ${field} array.`);
  }
};

const requireTextEntries = (manifest, field, fields, slug) => {
  requireArray(manifest, field, slug);
  manifest[field].forEach((entry, index) => {
    if (entry === null || typeof entry !== "object") {
      throw new Error(`${slug}/game.json ${field}[${index}] must be an object.`);
    }
    fields.forEach((entryField) => {
      if (typeof entry[entryField] !== "string" || !entry[entryField].trim()) {
        throw new Error(`${slug}/game.json ${field}[${index}] must include a non-empty ${entryField}.`);
      }
    });
  });
};

const resolveGameFile = (gameDir, relativePath, label) => {
  const resolvedPath = resolve(gameDir, relativePath);
  if (!resolvedPath.startsWith(`${gameDir}${sep}`) || !existsSync(resolvedPath)) {
    throw new Error(`${label} does not exist inside the game directory: ${relativePath}`);
  }
  return resolvedPath;
};

const gameEntries = readdirSync(gamesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .sort((a, b) => a.name.localeCompare(b.name));

const games = gameEntries.map((entry) => {
  const slug = entry.name;
  const gameDir = join(gamesDir, slug);
  const manifestPath = join(gameDir, "game.json");
  const packagePath = join(gameDir, "package.json");

  if (!existsSync(manifestPath)) {
    throw new Error(`${slug} is missing game.json.`);
  }
  if (!existsSync(packagePath)) {
    throw new Error(`${slug} is missing package.json.`);
  }

  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));

  ["title", "summary", "cover"].forEach((field) => requireText(manifest, field, slug));
  ["tags"].forEach((field) => requireArray(manifest, field, slug));
  requireTextEntries(manifest, "rules", ["text"], slug);
  if (!packageJson.scripts?.build || !packageJson.scripts?.test) {
    throw new Error(`${slug}/package.json must include build and test scripts.`);
  }

  const coverSource = resolveGameFile(gameDir, manifest.cover, `${slug} cover`);
  return {
    slug,
    gameDir,
    manifest,
    coverSource,
    order: Number.isFinite(manifest.order) ? manifest.order : 999,
  };
}).sort((a, b) => a.order - b.order || a.manifest.title.localeCompare(b.manifest.title));

if (games.length === 0) {
  throw new Error("No game projects were found in games/.");
}

rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });
writeFileSync(join(outputDir, ".nojekyll"), "");

const siteAssetsDir = join(outputDir, "assets");
mkdirSync(siteAssetsDir, { recursive: true });
const compiledStyles = sass.compile(join(siteDir, "site.scss"), {
  loadPaths: [join(rootDir, "node_modules")],
  quietDeps: true,
  silenceDeprecations: ["import"],
  style: "compressed",
});
writeFileSync(join(siteAssetsDir, "site.css"), compiledStyles.css);
await bundle({
  bundle: true,
  entryPoints: [join(siteDir, "site.js")],
  format: "iife",
  minify: true,
  outfile: join(siteAssetsDir, "site.js"),
  platform: "browser",
  target: ["es2020"],
});

const homeTemplate = readFileSync(join(templatesDir, "home.html"), "utf8");
const notFoundTemplate = readFileSync(join(templatesDir, "404.html"), "utf8");

const cards = [];
const modals = [];

for (const game of games) {
  const { slug, gameDir, manifest, coverSource } = game;
  const gameOutputDir = join(outputDir, "games", slug);
  const mediaOutputDir = join(gameOutputDir, "media");
  mkdirSync(mediaOutputDir, { recursive: true });

  const coverName = `cover${extname(coverSource).toLowerCase()}`;
  cpSync(coverSource, join(mediaOutputDir, coverName));

  console.log(`\n[${slug}] npm run build -- --base=./`);
  const build = spawnSync("npm", ["run", "build", "--", "--base=./"], {
    cwd: gameDir,
    stdio: "inherit",
  });
  if (build.status !== 0) {
    process.exit(build.status ?? 1);
  }

  const distDir = join(gameDir, "dist");
  if (!existsSync(join(distDir, "index.html"))) {
    throw new Error(`${slug} build did not produce dist/index.html.`);
  }
  cpSync(distDir, gameOutputDir, { recursive: true });

  const tags = manifest.tags
    .map((tag) => `<span class="badge text-bg-secondary">${escapeHtml(tag)}</span>`)
    .join("");
  const rules = manifest.rules
    .map((rule) => `<p class="mb-3">${escapeHtml(rule.text)}</p>`)
    .join("\n");
  const modalId = `game-modal-${slug}`;
  const publicSlug = encodeURIComponent(slug);
  const coverPath = `games/${publicSlug}/media/${coverName}`;
  const searchText = [manifest.title, manifest.summary, ...manifest.tags].join(" ");

  cards.push([
    `<div class="col" data-game-slug="${escapeHtml(slug)}" data-game-search-text="${escapeHtml(searchText)}">`,
    '<article class="card h-100 shadow-sm">',
    '<div class="ratio ratio-16x9 bg-dark">',
    `<img src="games/${encodeURIComponent(slug)}/media/${coverName}" class="card-img-top object-fit-cover" alt="${escapeHtml(manifest.title)} 遊戲封面" loading="lazy">`,
    "</div>",
    '<div class="card-body d-flex flex-column">',
    `<div class="d-flex flex-wrap gap-2 mb-3">${tags}</div>`,
    `<h3 class="h5 card-title">${escapeHtml(manifest.title)}</h3>`,
    `<p class="card-text text-body-secondary">${escapeHtml(manifest.summary)}</p>`,
    '<div class="d-grid gap-2 mt-auto">',
    `<a class="btn btn-primary" href="games/${publicSlug}/">開始遊戲</a>`,
    `<button type="button" class="btn btn-secondary" data-bs-toggle="modal" data-bs-target="#${escapeHtml(modalId)}" aria-controls="${escapeHtml(modalId)}">查看遊戲</button>`,
    '</div>',
    "</div>",
    "</article>",
    "</div>",
  ].join(""));

  modals.push([
    `<div class="modal fade" id="${escapeHtml(modalId)}" tabindex="-1" aria-labelledby="${escapeHtml(modalId)}-label" aria-hidden="true">`,
    '<div class="modal-dialog modal-lg modal-dialog-scrollable">',
    '<div class="modal-content">',
    '<div class="modal-header">',
    `<h2 class="modal-title h4" id="${escapeHtml(modalId)}-label">${escapeHtml(manifest.title)}</h2>`,
    '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="關閉"></button>',
    '</div>',
    '<div class="modal-body">',
    '<div class="ratio ratio-16x9 rounded overflow-hidden bg-dark mb-4">',
    `<img src="${coverPath}" class="img-fluid object-fit-cover" alt="${escapeHtml(manifest.title)} 遊戲封面">`,
    '</div>',
    `<div class="d-flex flex-wrap gap-2 mb-3">${tags}</div>`,
    `<p class="lead">${escapeHtml(manifest.summary)}</p>`,
    `<div class="text-body-secondary">${rules}</div>`,
    '</div>',
    '<div class="modal-footer">',
    `<a class="btn btn-primary" href="games/${publicSlug}/">開始遊戲</a>`,
    '</div>',
    '</div>',
    '</div>',
    '</div>',
  ].join(""));
}

writeFileSync(join(outputDir, "index.html"), render(homeTemplate, {
  GAME_COUNT: games.length,
  GAME_CARDS: cards.join("\n"),
  GAME_MODALS: modals.join("\n"),
}));
writeFileSync(join(outputDir, "404.html"), render(notFoundTemplate, {
  SITE_ROOT: siteRoot,
}));

console.log(`\nBuilt ${games.length} game${games.length === 1 ? "" : "s"} into pages-dist/.`);
