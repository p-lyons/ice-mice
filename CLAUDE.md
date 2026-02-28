# CLAUDE.md

## Project Overview

Ice Mice is a top-down arcade game built with Phaser 3 and Vite. The player controls a mouse sliding across a frozen pond, collecting cheese while avoiding patrolling polar bears. Movement is momentum-based with low friction (the ice-sliding feel is the core mechanic). The target audience is ~7-year-old kids.

## Tech Stack

- **Phaser 3** — game framework (arcade physics, not matter)
- **Vite** — dev server and bundler
- **Vanilla JavaScript** — no TypeScript, no frameworks beyond Phaser
- **Node canvas** — for generating placeholder sprite assets

## Project Structure

```
ice-mice/
├── index.html
├── package.json
├── vite.config.js
├── CLAUDE.md
├── public/
│   └── assets/          # sprites, audio, all static assets
└── src/
    ├── main.js           # Phaser game config and boot
    ├── levels.js          # level layouts as 2D arrays
    ├── scenes/
    │   ├── BootScene.js
    │   ├── MenuScene.js
    │   ├── GameScene.js
    │   └── LevelCompleteScene.js
    └── entities/
        ├── Mouse.js
        └── PolarBear.js
```

## Game Design Rules

These are intentional design decisions. Do not change them without asking.

- **Movement**: The mouse accelerates with arrow keys/WASD and decelerates slowly (low drag ~50-80). This slippery feel is the entire point. Never set drag high enough that the mouse stops quickly.
- **Collision with bears resets the level**, not the game. No lives system, no game-over screen. The player just restarts the current level instantly. This keeps it forgiving for young kids.
- **Bears patrol fixed waypoint paths** at constant speed. Paths should be simple and predictable (back-and-forth or rectangular loops) so a child can learn the pattern.
- **The mouse hole exit only activates after all cheese is collected.** It should visually change (pulse/glow) when active.
- **Levels are 2D arrays** in `levels.js` using tile codes: 0=ice, 1=snowbank, 2=cheese, 3=mouse hole, 4=mouse start, 5=bear start.
- **Canvas is 800x600.** Tiles are 48x48. Top bar reserved for HUD.
- **Difficulty curve**: Level 1 has no bears (tutorial). Bears are introduced in level 3. Max 3 bears by level 5.

## Coding Conventions

- Use ES module `import`/`export` syntax.
- One class per file. Scene files export a single Phaser.Scene subclass. Entity files export a single class extending Phaser.GameObjects.Sprite or similar.
- Keep game constants (acceleration, drag, max velocity, bear speed) as named constants at the top of the relevant file, not buried in method bodies. This makes tuning easy.
- Prefer Phaser's built-in systems (arcade physics, tweens, particle emitters, audio manager) over rolling custom solutions.
- No build-time asset pipeline. Assets are static files in `public/assets/` loaded in BootScene's `preload()`.

## Physics Tuning Reference

These values are starting points. I will playtest and ask you to adjust them.

| Parameter           | Value   | File       |
|---------------------|---------|------------|
| Mouse acceleration  | 300-400 | Mouse.js   |
| Mouse drag          | 50-80   | Mouse.js   |
| Mouse max velocity  | 250     | Mouse.js   |
| Mouse bounce        | 0.4     | Mouse.js   |
| Bear patrol speed   | 80-120  | PolarBear.js |

## When I Give Feedback

When I say things like "too slippery" or "bears are too fast," adjust the specific physics constant by ~20-30% in the indicated direction and tell me what you changed and to what value. Don't refactor unrelated code at the same time.

## Things to Avoid

- Do not add TypeScript.
- Do not introduce a physics engine beyond Phaser's built-in arcade physics.
- Do not create a complex asset pipeline, webpack config, or build tooling beyond Vite.
- Do not add difficulty settings or options menus. Keep it simple — one path through 5 levels.
- Do not make the game punishing. When in doubt, make it easier. The player is 7.
- Do not use `var`. Use `const` by default, `let` when mutation is needed.
