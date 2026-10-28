# PromoChristmasJetpack

Christmas arcade game for Promodev, built with Phaser and Vite. Play in landscape on a phone or desktop.

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

- Three lives, occasional hearts, one red-and-gold collectible gift, and eight PROMODEV letters.
- Seeded obstacle sections, increasing speed, recovery sections, electrical traps, missiles with warnings, and lasers that charge before activation.
- Armoured sleigh: two impacts. Magnetic hoverboard: attraction for 20 seconds. Christmas rocket: 20 seconds of faster travel and double gift points.
- Colleagues are harmless. Pass them on foot to earn a high-five bonus.

Email profiles currently have no verification step, as requested. Entering an existing email accesses that profile. Do not treat this as verified identity or use the current scores for prize adjudication.

The progression API exists, but the mission/shop UI and end-of-run progression synchronization still need completion. Scores currently synchronize through `/api/score`.

## Sources and assets

See [gameplay references](docs/gameplay-reference.md) for the boundary between official source descriptions and Promodev tuning. Generated-art prompts and normalization scripts are preserved in `art-source/` and `scripts/`. Final runtime assets are in `public/art/`.

The asset preparation scripts record the original generation paths for provenance. Their source PNG files are not required to build or deploy the game; final WebP assets are checked into Git.

## Animation and sound checks

Open `/tests/visual-characters.html` on the Vite development server to compare walking, greeting and crouching with the same body parts. The fixture also exercises vehicle landings and audio pause, mute and restart behavior. It is not included in the production build.

Original ElevenLabs effects are checked into `public/audio/` and cached for offline play. Prompts are in `art-source/audio-prompts.json`. Regeneration requires `ELEVENLABS_API_KEY` in the local environment and `python3 scripts/generate-audio.py`; the browser never calls ElevenLabs or receives an API key. Sound begins after a player gesture and can be muted from the toolbar.
