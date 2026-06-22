# Theme songs — Suno AI prompts

The reader has a mini music player (♪ button → play/pause, prev, next, playlist).
It reads **`assets/audio/tracks.json`**. To add songs:

1. Generate in Suno, export MP3s, drop them in **`assets/audio/`**.
2. Edit **`assets/audio/tracks.json`** — one entry per track:
   ```json
   [
     { "file": "assets/audio/theme1.mp3", "title": "We Protect Our Own" },
     { "file": "assets/audio/theme2.mp3", "title": "Crows Never Die" }
   ]
   ```
3. Playlist loops; the player remembers the last track + play state.

## Style prompt (paste into Suno "Style of Music")

```
dark cinematic post-apocalyptic anthem, industrial-orchestral hybrid, slow menacing build,
distorted down-tuned guitars, pounding war drums, ominous low brass, ghostly choir,
gritty and vengeful, heavy and anthemic, minor key, ~80 BPM, wide film-trailer dynamics
```

## Instrumental (no lyrics)

Toggle **Instrumental** ON in Suno and use this as the Style prompt (leave Lyrics empty):

```
instrumental, dark cinematic post-apocalyptic theme, industrial-orchestral hybrid,
slow menacing build into a heavy anthemic drop, distorted down-tuned guitar ostinato,
pounding war drums and taiko, ominous low brass swells, ghostly wordless choir pads,
ash-and-ember atmosphere, gritty and vengeful, minor key, ~80 BPM, no vocals,
wide film-trailer dynamics, loopable
```

Tip: if Suno still adds vocals, add the negative tag `no vocals, no singing, no lyrics`
in the style box and keep the Lyrics field empty.

## Lyrics (paste into "Lyrics" — only for the vocal version)

```
[Intro]
(low choir, distant sirens, ash falling)

[Verse]
Fourteen million in the ashes, a green leaf left for dead
Out of the smoke a quiet figure, number thirteen on his head

[Build]
They mocked the armor, called it fear —
they should have run when he drew near

[Chorus]
Covenant — we protect our own
Covenant — we never forgive
Strike the strongholds, burn them down
The crows can't kill what won't lie down

[Verse 2]
One leads with fire, one keeps the line, one moves the pieces unseen
Silence was the warning shot — the answer comes in flame

[Bridge]
Do it — or no balls
The scattering was only phase one

[Outro]
(choir swells) Covenant stands... Covenant stands...
```

## Notes
- Title suggestion: **"We Protect Our Own"**
- Keep it loopable: pick a take without a hard cold ending, or trim the outro so it
  loops cleanly.
- Want a shorter sting (10–20s) for the landing instead of a full track? Generate a
  second clip with the same style prompt and the `[Intro]` + `[Chorus]` only.
