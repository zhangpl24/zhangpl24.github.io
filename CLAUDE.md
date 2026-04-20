# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

See `AGENTS.md` for the canonical project overview (directory table, CI, etc.). This file captures the points most load-bearing for editing.

## What this repo is

Personal static blog built with **Zensical** (Material-for-MkDocs-style generator) deployed to GitHub Pages at `https://zhangpl24.github.io/`. UI language is Chinese (`language = "zh"`). Sole config is `zensical.toml`; content lives in `docs/`.

## Commands

```bash
pip install 'zensical>=0.0.28'   # one-time setup (use .venv)
zensical serve                    # live-reload preview
zensical build --clean            # CI-equivalent build → site/
```

`site/` is a build artifact — never commit or hand-edit it. CI (`.github/workflows/docs.yml`) re-runs `zensical build --clean` on push to `main`/`master` and uploads `site/` to Pages.

## Architecture: how content becomes navigation

The site has **two parallel structures** that must stay in sync:

1. **Filesystem** — topic folders under `docs/` (e.g. `docs/hpc/`, `docs/编译原理/`, `docs/tools/`, `docs/blog/`). Each topic folder has its own `index.md` that lists the notes inside it.
2. **Sidebar `nav`** in `zensical.toml` — only references each topic's `index.md`, never individual notes. Individual posts are discovered via the topic's `index.md` list page, not the sidebar.

So adding a new note is **two edits**: the `.md` file itself, plus a link entry in the topic's `index.md`. Only when creating a *new topic* do you touch `zensical.toml`'s `nav`.

Non-course short-form writing goes in `docs/blog/` (update `docs/blog/index.md`). Course/topic notes go in `docs/<topic>/`.

## Frontmatter convention

Match existing posts — typical fields are `date` (`YYYY-MM-DD`), `icon` (e.g. `lucide/...`), `description`. Assets live under `docs/assets/<topic>/` and are referenced with paths relative to `docs/`.

## Theme overrides

`overrides/` is wired via `custom_dir = "overrides"` in `zensical.toml` — currently only `overrides/partials/toc.html`. Template overrides go here, not into `site/`.

## Importing from Obsidian (`~/Documents/Obsidian Vault`)

When the task is "import/sync a note from my Obsidian vault", per `.cursor/rules/obsidian-notes-upload.mdc`:

- **Report first**: before writing to `docs/`, list the source `.md` filename(s) and attachment paths you're pulling from, so the user can confirm you found the right files.
- **Mirror the topic folder**: vault `course/hpc/foo.md` → `docs/hpc/foo.md`. Do not dump course notes into `docs/blog/`.
- **Rewrite Obsidian-specific syntax** (do not paste raw):
  - `[[wikilinks]]` → standard Markdown links or bold text
  - `![[embeds]]` → standard `![](...)` with the asset copied into `docs/assets/...`
  - `> [!note]` callouts → plain `>` blockquotes or heading + paragraph
  - Drop `tags`/`aliases`/`cssclasses` frontmatter; keep/synthesize `date`/`icon`/`description`.
- **Copy assets into the repo** — never link to `~/Documents/...` absolute paths (static site can't resolve them).
