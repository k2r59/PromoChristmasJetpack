# PromoChristmasJetpack

Christmas endless runner for Promodev, built with Phaser and Vite. Play in landscape on a phone or desktop.

Production: https://jetpack.promo.dev

## Local development

Use Node.js 24 or newer. The local API uses Node's SQLite module.

```sh
npm ci
npm run dev -- --port 5188
```

Open http://localhost:5188. Local profiles are stored in `.data/noel.sqlite`, which Git ignores.

Hold touch, mouse, or Space to rise. Release to descend and run on the floor. Press P or Escape to pause.

## Validate and deploy

```sh
npm run build
npm test
npm run deploy
```

Deployment requires a Cloudflare login authorized for the configured account. `npm run deploy` builds the game, applies D1 migrations, and deploys the Worker and static assets. `wrangler.jsonc` binds `DB` to the dedicated `promo-christmas-jetpack` database and attaches `jetpack.promo.dev` as a custom domain.

Use `npm run dev:worker` to test with local Cloudflare bindings. Production data is separate from local data.

## Game rules

- Endless obstacle course with gradually increasing speed. No shooting or stage objectives.
- Three lives, occasional hearts, grid/arc gift formations and eight PROMODEV letters.
- Seeded obstacle sections, increasing speed, recovery sections, electrical traps, missiles with warnings, and lasers that charge before activation.
- Armoured sleigh: two impacts. Magnetic hoverboard: attraction for 20 seconds. Christmas rocket: 20 seconds of faster travel and double gift points.
- Colleagues are harmless. Pass them on foot to earn a high-five bonus.

Email profiles currently have no verification step, as requested. Entering an existing email accesses that profile. Do not treat this as verified identity or use the current scores for prize adjudication.

Scores synchronize through `/api/score`. The separate long-term mission/shop API exists, but its UI and end-of-run progression synchronization still need completion.

## Sources and assets

See [gameplay references](docs/gameplay-reference.md) for the boundary between official source descriptions and Promodev tuning. Generated-art prompts and normalization scripts are preserved in `art-source/` and `scripts/`. Final runtime assets are in `public/art/`.

The asset preparation scripts record the original generation paths for provenance. Their source PNG files are not required to build or deploy the game; final WebP assets are checked into Git.

## Animation and sound checks

Open `/tests/visual-characters.html` on the Vite development server to compare walking, greeting and crouching with the same body parts. The fixture also exercises vehicle landings and audio pause, mute and restart behavior. It is not included in the production build.

Runtime audio now uses selected Kenney Sci-Fi and Interface effects under CC0; generated ElevenLabs effects were retired after user feedback. Sources, package checksums and output checksums are recorded in `art-source/curated-audio-receipt.json`; original licenses ship in `public/licenses/`. There is no continuous engine or background melody. Audition effects at `/tests/audio-review.html` on the dev server.

The responsive fixture `/tests/responsive.html` checks menu and HUD geometry across phone and tablet dimensions, including simulated safe-area insets. These are browser-layout checks, not certification on physical iPhone hardware. `src/viewport.js` uses the visual viewport for both the canvas and interface, including dynamic browser chrome and the software keyboard.
