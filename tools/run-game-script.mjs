import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const command = process.argv[2];
if (!new Set(["ci", "test"]).has(command)) {
  console.error("Usage: node tools/run-game-script.mjs <ci|test>");
  process.exit(1);
}

const rootDir = resolve(import.meta.dirname, "..");
const gamesDir = join(rootDir, "games");
const gameDirectories = readdirSync(gamesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => join(gamesDir, entry.name))
  .filter((directory) => {
    try {
      JSON.parse(readFileSync(join(directory, "package.json"), "utf8"));
      return true;
    } catch {
      return false;
    }
  })
  .sort();

if (gameDirectories.length === 0) {
  console.error("No game projects were found in games/.");
  process.exit(1);
}

for (const directory of gameDirectories) {
  const slug = directory.split("/").at(-1);
  console.log(`\n[${slug}] npm ${command}`);
  const args = command === "ci" ? ["ci"] : ["test"];
  const result = spawnSync("npm", args, {
    cwd: directory,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
