# CLAUDE.md

## Project Overview

Ice Mice is a top-down arcade game built with Phaser 3 and Vite. The player controls a mouse sliding across a frozen pond, collecting cheese while avoiding patrolling polar bears, a pouncing fox, and hazardous ice. Movement is momentum-based with low friction (the ice-sliding feel is the core mechanic). Supports 1 player, 2-player local co-op, and a 2P competitive Cheese Chase mode, all on one keyboard (P1 arrows, P2 WASD). Solo players race a ghost of their best run per level. A built-in Level Painter lets kids paint their own ponds and share them as URLs. The target audience is kids ~7-10.

## Tech Stack

- **Phaser 3** — game framework (arcade physics, not matter)
- **Vite** — dev server and bundler
- **Vanilla JavaScript** — no TypeScript, no frameworks beyond Phaser
- **Node canvas** — for generating placeholder sprite assets (`node scripts/generate-assets.js`, `node scripts/generate-sounds.js`)

## Project Structure

```
ice-mice/
├── index.html
├── package.json
├── vite.config.js
├── CLAUDE.md
├── scripts/
│   ├── generate-assets.js   # draws all placeholder sprites with node-canvas
│   └── generate-sounds.js   # synthesizes all WAV sound effects
├── public/
│   └── assets/          # sprites, audio, all static assets
└── src/
    ├── main.js           # Phaser game config and boot
    ├── levels.js          # level layouts as 2D arrays (25 levels, each with a name)
    ├── progress.js        # localStorage save: beaten levels, stars, ghosts, hat choice
    ├── levelCodec.js      # base64url encode/decode of painter levels for share URLs
    ├── scenes/
    │   ├── BootScene.js
    │   ├── MenuScene.js       # modes, level select, hat rack, shared-level prompt
    │   ├── GameScene.js       # also owns ghost racing + Cheese Chase scoring
    │   ├── LevelCompleteScene.js  # adventure, chase-results, and custom-level branches
    │   └── EditorScene.js     # the Level Painter (paint, test, share)
    └── entities/
        ├── Mouse.js       # player(s); takes texture + control scheme; hat + fish carry
        ├── PolarBear.js   # waypoint patroller with "!" alert (visual only) + slip gag
        ├── Walrus.js      # sleeping bumper, pings mice off its belly
        ├── Penguin.js     # friendly belly-sliding NPC, nudges but never hurts
        ├── Fox.js         # timing hazard: sleep -> telegraph -> pounce on a marked tile
        └── Otter.js       # lives in a pool; rescues fallen mice, never a fail
```

## Game Design Rules

These are intentional design decisions. Do not change them without asking.

- **Movement**: The mouse accelerates with arrow keys/WASD and decelerates slowly (low drag ~50-80). This slippery feel is the entire point. Never set drag high enough that the mouse stops quickly. (Slush tiles are the sanctioned exception: localized high-drag terrain that makes the rest of the ice feel slipperier by contrast.)
- **Failure is funny, not scary.** Getting caught plays a short gag (dizzy spin, boing back to start). No lives system, no game-over screen.
  - **1 player**: collision with a bear or water resets the current level.
  - **2 players**: only the caught mouse respawns at the start; cheese and level state persist (avoids sibling blame wars).
- **Co-op**: P1 = arrow keys + gray mouse, P2 = WASD + brown mouse (`mouse2`). The mice collide and bounce off each other on purpose. Cheese is a shared pool; either mouse may take the exit.
- **Bears patrol fixed waypoint paths** at constant speed. Paths should be simple and predictable (back-and-forth, rectangular, or triangular loops) so a kid can learn the pattern. The "!" alert when a mouse is near is visual drama only — it must never change bear behavior.
- **The mouse hole exit only activates after all regular cheese is collected.** It visually changes (pulse/glow) when active.
- **Golden cheese is optional.** One per level, placed somewhere risky. Collecting it earns a star (shown on the level select, saved via `progress.js`). It must never be required to finish a level, and it respawns on a full level reset (the star is earned in one clean run).
- **Walruses are bumpers, penguins are friends.** Neither ever hurts the mouse. Walrus = big bounce with a wake-up gag; penguin = slow waypoint slider that nudges mice.
- **Speed streaks** fling the mouse above its normal max velocity in the arrow's direction. They are joy first, challenge second. Spinners are the same spirit: whirl, then fling wherever the mouse happens to face.
- **The fox is a TIMING hazard where bears are a ROUTING hazard.** Its cycle (sleep -> yawn/crouch telegraph -> pounce onto a fixed paw-print-marked tile -> sniff -> trot home) never varies, so kids learn it like a crosswalk. Asleep and stretching, it is harmless. Never make the pounce target move.
- **Otters are mercy, not hazard.** Falling into an otter pool gets the mouse tossed back onto the ice, dizzy but alive. Use otter pools to soften hard levels instead of difficulty settings.
- **Pushable ice blocks** slide friction-free in cardinals until they hit something, and plug water holes into safe frozen tiles. Blocks reset with the level.
- **Burrows teleport in pairs** (reading order: 1st+2nd, 3rd+4th), preserving velocity. Pairs are color-tinted to match.
- **Wind lanes** push with steady acceleration; they interact with momentum rather than overriding it.
- **Fish delivery is the golden-cheese of kindness**: optional, celebratory, never required. Carry the frozen fish to a penguin for a party; dropped fish return to their spot.
- **Ghost races (solo only)**: each level stores the best run's path in `progress.js`; a translucent mouse replays it. The ghost only updates when beaten, and a level reset restarts the run - clean runs only, like the golden star.
- **Hats are cosmetic only**, unlocked at star milestones (2/5/8/12) and worn by P1. No gameplay effects, ever.
- **Cheese Chase (2P)**: every cheese is a point (golden = 3), round ends when the pond is bare, being caught just respawns you. No hole, no failure, pure race.
- **Level Painter**: paints the same 2D arrays the game uses; bear/penguin patrols and fox targets are auto-derived so kids never see waypoints. Shared levels travel as `#level=<base64url JSON>` and never touch saved progress.
- **Levels are 2D arrays** in `levels.js`. Tile codes: 0=ice, 1=snowbank, 2=cheese, 3=mouse hole, 4=mouse start, 5=bear start, 6=cracking ice, 7=melting ice, 8=golden cheese, 9=walrus, 10-13=speed streak (right/left/up/down), 14=slush, 15=penguin start, 16=ice block, 17=burrow, 18=spinner, 19-22=wind (right/left/up/down), 23=fox den, 24=otter pool, 25=frozen fish. Bears and penguins get waypoint arrays (`bears`, `penguins`) and foxes get pounce-target positions (`foxes`), matched to their start tiles in reading order. Each level has a `name` kids can remember it by.
- **Canvas is 800x600.** Tiles are 48x48. Top bar reserved for HUD.
- **Difficulty curve**: Levels 1-2 have no bears (tutorial). Bears are introduced in level 3, cracking ice in level 3, melting ice in level 4. Max 3 bears. Levels 6-10 remix the mechanics at 7-10-year-old difficulty: challenging but never punishing. Levels 11-15 each introduce one new mechanic (blocks, burrows, wind+spinners, fox+otter+fish, then a finale remix under the aurora) - never more than one new idea per level. Levels 16-25 are themed remixes (each has ONE central gimmick, e.g. burrow-only vault, headwinds, fox alley, bear crosswalk); level 21 is a deliberate no-bear breather, level 25 is the grand finale.
- **Never gate required progress behind meltable/breakable-only access.** Cracking and melting tiles become permanent holes; if the only route to a regular cheese or the exit crosses them, the level can become unwinnable. Rooms sealed except for melting/cracking gates may hold only optional treats (golden cheese, fish). Burrow-only rooms are fine (burrows never close).

## Coding Conventions

- Use ES module `import`/`export` syntax.
- One class per file. Scene files export a single Phaser.Scene subclass. Entity files export a single class extending Phaser.GameObjects.Sprite or similar. (`progress.js` is a small plain-function module.)
- Keep game constants (acceleration, drag, max velocity, bear speed) as named constants at the top of the relevant file, not buried in method bodies. This makes tuning easy.
- Prefer Phaser's built-in systems (arcade physics, tweens, particle emitters, audio manager) over rolling custom solutions.
- No build-time asset pipeline. Assets are static files in `public/assets/` loaded in BootScene's `preload()`. Placeholder assets are regenerated with the scripts in `scripts/`.

## Physics Tuning Reference

These values are starting points. I will playtest and ask you to adjust them.

| Parameter            | Value   | File       |
|----------------------|---------|------------|
| Mouse acceleration   | 300-400 | Mouse.js   |
| Mouse drag           | 50-80   | Mouse.js   |
| Mouse max velocity   | 250     | Mouse.js   |
| Mouse bounce         | 0.4     | Mouse.js   |
| Slush drag           | ~600    | Mouse.js   |
| Boost max velocity   | ~420    | Mouse.js   |
| Bear patrol speed    | 80-120  | PolarBear.js |
| Penguin slide speed  | ~70     | Penguin.js |
| Ice block slide speed| ~170    | GameScene.js |
| Wind force           | ~150    | GameScene.js |
| Fox trot-home speed  | ~110    | Fox.js     |
| Fox sleep/telegraph  | 2600/1100 ms | Fox.js |
| Otter toss speed     | ~280    | Otter.js   |
| Spin duration        | ~650 ms | GameScene.js |

## When I Give Feedback

When I say things like "too slippery" or "bears are too fast," adjust the specific physics constant by ~20-30% in the indicated direction and tell me what you changed and to what value. Don't refactor unrelated code at the same time.

## Things to Avoid

- Do not add TypeScript.
- Do not introduce a physics engine beyond Phaser's built-in arcade physics.
- Do not create a complex asset pipeline, webpack config, or build tooling beyond Vite.
- Do not add difficulty settings or options menus. Keep it simple — one path through 25 levels (plus the level select, Cheese Chase, and the Level Painter).
- Do not make the game punishing. When in doubt, make it easier. The players are 7-10.
- Do not use `var`. Use `const` by default, `let` when mutation is needed.
