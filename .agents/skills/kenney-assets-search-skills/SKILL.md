---
name: kenney-assets-search-skills
description: Find, compare, recommend, and open Kenney asset packs from ordinary Chinese or natural-language game requirements, and download verified official archives into the workspace assets-source directory only when explicitly requested. Use whenever the user wants Kenney assets for a game, even when they do not know pack names or technical search terms.
---

# Kenney Assets Search

Use the bundled asset-name index for precise candidate discovery, then use an available web or browser tool to verify current Kenney asset pages. The index improves recall; the official website is authoritative for current availability, contents, formats, and URLs.

## User experience

- Accept ordinary requests such as “幫我找適合太空射擊遊戲的素材”; the user does not need to know the skill name, index, pack names, or English keywords.
- Treat “下載到 assets-source” or an equivalent phrase as explicit permission to download the selected official archive. Finding, recommending, comparing, or opening a page alone is not download permission.
- Keep the index, text-search commands, source manifest, and candidate-ranking process internal unless the user explicitly asks how the skill works.
- Present matched filenames as “相關素材” or explain them naturally. Do not label results as “索引命中”.
- Do not ask the user to search, inspect, or understand the TSV file.

## Local index

Search [references/assets-index.tsv](references/assets-index.tsv) when the request names an object, file, visual element, or desired game content. It is a static snapshot derived from Kenney Game Assets All-in-1 3.7.0 and has these tab-separated columns:

```text
asset_name    pack_name    category    search_terms
```

- Search only targeted matches with a local text-search tool such as `rg`; do not load the whole file into context.
- Match exact `asset_name` values first. For natural-language requests, search the normalized `search_terms`, pack name, and category columns with the strongest English nouns.
- Narrow large result sets with additional terms and compare which packs contain several relevant asset names. Keep multiple candidates when a generic asset name maps to more than one pack.
- Treat the index as discovery evidence, not proof that a pack is currently online. It has no official URLs and may omit packs whose source manifest had no file list.
- The skill does not depend on the original `assets.json` at runtime and includes no update script or automatic update workflow.

## Workflow

1. Identify the user's intent across four dimensions:
   - subject or world: medieval, space, racing, farm, dungeon
   - gameplay: platformer, shooter, puzzle, card game, tower defense
   - visual style: pixel, vector, isometric, low-poly, monochrome
   - asset role: character, environment, tile, UI, icon, audio, font
2. Translate non-English intent into 3–8 concise English terms. Include subject, gameplay, visual style, and asset role only when relevant.
3. Search the local index with the strongest object or asset-role terms and collect candidate pack names plus a few representative matching assets. If the index is unavailable or has no useful match, continue with online search.
4. Search `https://kenney.nl/assets/` for the candidate pack names and remaining requirements using the site's visible search, categories, tags, and pagination. If direct site navigation is unavailable, use a focused web query restricted to `kenney.nl/assets`.
5. Open the strongest candidate pages and verify the visible pack title, category, contents or formats, and current URL. Never infer a URL from the local pack name.
6. Recommend coherent packs. Prefer one primary pack and at most two supporting packs.
7. If the user explicitly requested a download, follow the download workflow for the selected verified pack.
8. Return verified official links, representative matching assets when useful, any completed download path, and a short reason for each recommendation.

## Query strategy

- Prefer concrete nouns over prose: `space ship laser UI` is stronger than `assets for a space game`.
- Include both the object and its likely pack vocabulary: `car vehicle racing road`.
- Use `UI`, `interface`, `icon`, and `cursor` deliberately; they describe different asset roles.
- Use normalized word forms for compact filenames: search `ground burst` as well as `groundBurst`, and `space ship` as well as `spaceship` when relevant.
- For broad requests, narrow the index with the most concrete asset noun first. Broaden once by removing the least important constraint if needed.
- Search the official site with verified pack titles from the index before falling back to broader keywords.
- Treat verified pack-title matches as stronger evidence than snippets or search-result text.
- Explain partial matches instead of presenting them as exact.

## Recommendations

Return up to five packs unless the user asks for more. For each pack include:

1. pack name and category
2. why it matches the user's intent
3. up to five representative asset names when they help explain the match
4. relevant contents or formats visible on the live page
5. verified official URL

Prefer one primary pack and at most two complementary packs. If UI, icons, or audio come from another pack, say that they are supporting assets so the visual direction remains clear.

## Opening results

- If the user asks to open or jump to a result, use browser control to navigate to the verified pack URL and leave the tab open.
- If browser control is unavailable, return the verified URL as a Markdown link.
- Never invent a `/assets/<slug>` URL. Open or link only URLs observed on the official site or verified through an official page.
- Do not purchase, sign in, or add items to a collection unless the user explicitly asks.

## Downloading to assets-source

Download only when the user explicitly asks. A request to download a selected pack authorizes the free official pack archive, not the paid All-in-1 bundle, a donation, sign-in, purchase, or unrelated packs.

1. Verify the exact pack page on `https://kenney.nl/assets/` and use its visible official **Download** control. Never construct or guess a media URL.
2. If the site presents the donation prompt, choose **Continue without donating...** unless the user explicitly asked to donate. Do not initiate a payment flow.
3. Save the resulting official archive under the current workspace's `assets-source/` directory using the server-provided filename. If the browser first saves it to its default Downloads location, identify the exact newly downloaded file before moving it.
4. Do not overwrite an existing destination. If the same filename already exists and is identical, reuse it and report that no new copy was needed. If it differs, stop and ask before replacing or renaming it.
5. Verify that the destination exists, is non-empty, and is a readable archive. For ZIP files, run a non-extracting integrity check such as `unzip -t` when available.
6. Keep the original archive intact. Extract it only when the user explicitly asks to unpack it or when a separately authorized task requires selecting individual files; extract into `assets-source/<pack-name>/` without overwriting existing files.
7. Report the exact local path, file size, archive validation result, and whether it was extracted.

If browser download control is unavailable or the official download cannot be verified, leave the verified pack page open and explain the limitation. Do not switch to a mirror or download an inferred URL.

## Output shape

Keep the response compact:

```text
首選：<pack> — <why>
- 相關素材：<optional representative asset names>
- 類型：<verified category, contents, or formats>
- 官網：<verified official link>

搭配：<optional supporting pack> — <why>

下載：<optional exact assets-source path, size, validation, and extraction state>
```

Show generated English search terms only when they help explain a partial match or the user asks for them. Mention uncertainty when discovery or the live website has no exact semantic match. If a candidate cannot be verified online, label it as unavailable or possibly outdated and do not present it as currently available. Do not use the itch.io Development Log as a search index and do not maintain local update state.
