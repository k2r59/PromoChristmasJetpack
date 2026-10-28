# Gameplay reference

Sources reviewed on 2026-10-28:

- [Halfbrick's official trailer article](https://www.halfbrick.com/blog/jetpack-joyride-official-trailer): hold the screen to ascend and release to descend.
- [Halfbrick's App Store listing](https://apps.apple.com/us/app/jetpack-joyride/id457446957): endless running, lasers, zappers, guided missiles, vehicles, missions and one-touch controls.
- [Halfbrick vehicle support](https://halfbrick.helpshift.com/hc/en/4-jetpack-joyride/faq/689-how-do-i-upgrade-vehicles/): vehicle pickups, distinct vehicle behavior and magnetization.
- [Halfbrick power-up support](https://halfbrick.helpshift.com/hc/en/4-jetpack-joyride/faq/706-how-do-i-upgrade-power-ups-1692683521/): floating pickup tokens, shield protection, and no power-up spawning while riding a vehicle.

These public sources do not provide the original course generator, physics constants, obstacle probabilities or exact timing tables. This repository implements its own tuning; it does not claim numerical equivalence with Jetpack Joyride.

`src/course.js` controls seeded encounters, recovery sections, orientation and progression. `src/rules.js` controls movement and score. `src/vehicles.js` defines the three Promodev vehicle bonuses and floor contact geometry.

Promodev adaptations requested by the owner include three lives, recoverable hearts, letters, Christmas office obstacles, three custom vehicles, and male and female colleagues. These adaptations intentionally differ from the reference game.

Community background, not official documentation: [Scientists](https://jetpackjoyride.fandom.com/wiki/Scientists) describes harmless bystanders, evasion and high-five interactions. The Promodev colleagues use original artwork and non-damaging interactions.
