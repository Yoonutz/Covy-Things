# The Covenant Chronicles

An immersive, dependency-free web comic reader. A living dystopian scene (parallax
ruined city, ash, fog, lightning, CRT scanlines) wraps a 3D page-flip reader with a
built-in music player. Pure vanilla JS + CSS — no build step, no frameworks.

```
LANDING ──Enter──▶ LIBRARY ──pick book──▶ READER ──‹ Library / Esc──▶ LIBRARY
(series title,      (grid of book           (3D page-flip reader,
 bio, Story so far)  covers)                 magnify, per-book scene)
```

## Run / deploy

`books.json` and the panels load via `fetch`, so serve over HTTP (`file://` won't work):

```bash
python -m http.server          # then open http://localhost:8000
```

Deploy = push to any static host. On **GitHub Pages**, enable Pages → *Deploy from
branch* → `main` / root. `.nojekyll` is included so asset folders serve as-is.

## Project layout

```
index.html      3 view shells + persistent scene + audio/lightbox/help overlays
styles.css      scene, reader, ui, player, themed scrollbars  (mobile-first)
engine.js       layout (bestPartition/fitPage), flip, scene, router, player, magnify
books.json      data model — series{} + books[]
assets/
  covers/       cover-chN.webp  (library-card art)
  audio/        theme mp3s + tracks.json (playlist manifest)
  covenant-chN/ pN_M.webp panels (+ background.webp where used)
tools/
  slicer.html       browser panel-cutter: draw cuts → export ZIP + JSON  (primary)
  extract_panels.py / upscale.py   older CV pipeline (needs opencv; model not bundled)
source/         original full-page art (archival, for re-cutting)
```

## Add a book

1. Open **`tools/slicer.html`** in a browser. Load a full page image, **set the book id**
   first, draw H/V/angled cuts (each cut splits only the region you click), Export.
2. Unzip into `assets/<book-id>/`.
3. Paste the exported `books[]` entry into `books.json`; set `title` / `chapter` /
   `subtitle` / `bio` / `cover`.
4. Bump `ASSET_V` in `engine.js` only if you reuse existing filenames (busts caches).

```json
{
  "id": "covenant-ch8", "title": "…", "chapter": "Chapter VIII", "subtitle": "…",
  "bio": "…",
  "accent": "#a8352a",                                  // optional per-book accent
  "background": "assets/covenant-ch1/background.webp",  // ambient scene backdrop
  "cover": "assets/covers/cover-ch8.webp",
  "pages": [ { "panels": [ { "src": "assets/covenant-ch8/p1_1.webp", "ar": 0.91 } ] } ]
}
```

`ar` = panel width/height. `pages[]` = reading order; `panels[]` = left-to-right.
No engine changes needed — the book appears in the library automatically.

## Music

Drop MP3s in `assets/audio/` and list them in `assets/audio/tracks.json`
(`{ "file": "...", "title": "..." }`). The ♪ player loops the playlist (play/pause,
prev/next, seek, volume, playlist). Starts quietly on load. See `THEME_SONG.md` for
Suno prompts.

## Features

- 3D page-flip, tap-zones, arrow keys, swipe, clickable progress ticks
- **Magnify** (🔍): tap a panel → fullscreen lightbox, click to zoom, scroll/pinch, pan
- **Shareable deep links**: `#read/<book-id>/<page>`; back/forward + a copy-link button
- **Story so far** preface + generalized series bio on the landing
- Per-book accent theming; mobile-first; themed scrollbars; `prefers-reduced-motion` aware

## Notes / do-not-regress

- **Layout engine** (`bestPartition` + `fitPage`): justified rows at true aspect ratios,
  measure-and-fit. Zero letterbox/crop, even 9px gutters. Constants `PAGE_A = 0.74`,
  `GUTTER = 9`. Page sized by viewport height so it never clips the controls.
- **Perf**: no `backdrop-filter`, no `mix-blend-mode`, no `filter: blur()` on animated
  layers (all were per-frame stutter sources) — "glass" is faked with gradients +
  inset highlights; depth via `box-shadow`. Rain was removed (canvas couldn't match
  photoreal refraction). Keep it this way.
- `ASSET_V` (engine.js) is appended to every asset URL — bump it when reusing filenames.

## Support

If you enjoy it: [Buy me a Ko-fi](https://ko-fi.com/H2H41XXZWG) ☕

## License

Reader code: do as you like. Comic art & music © their creator.
