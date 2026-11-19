# Armor of God: Daily Watchfulness

A playable 2D tactical readiness and daily spiritual battle game, grounded in **Ephesians 6:10–18**,
**1 Peter 5:8–9**, and **2 Corinthians 10:4–5**.

You manage a believer's ordinary week — work, home, digital distraction, church life — while keeping all
seven pieces of spiritual readiness intact. Threats arrive on a canvas arena, each aimed at a specific
weakness. You answer with the right piece of armor, or with the Scripture that cuts the specific lie.

Built with plain HTML, CSS, and vanilla JavaScript on HTML5 Canvas. No frameworks, no build step, no assets.

---

## Play it now

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

A local server is recommended (ES modules and `localStorage` behave best over `http://`).

---

## The seven readiness gauges

| Gauge | Held by | Breaks into |
|---|---|---|
| **Belt of Truth** | honesty, confession, rejecting self-deception | compromise, double-mindedness |
| **Breastplate of Righteousness** | obedience, pure motives, quick repentance | guilt, condemnation |
| **Shoes of the Gospel of Peace** | forgiveness, peacemaking, readiness to share Christ | bitterness, panic |
| **Shield of Faith** | trusting God's promises | fear, doubt, despair, sudden crisis |
| **Helmet of Salvation** | identity in Christ, eternal hope | confusion, pride, worldly thinking |
| **Sword of the Spirit** | memorizing and applying specific Scriptures | lies unanswered, arguments instead of truth |
| **Watchful Prayer** | Spirit-led alertness | traps unseen, reacting instead of watching |

Watchful Prayer powers the whole set: below 45 prayer, incoming attacks conceal which piece they target.

---

## How a day works

1. **Morning Watch** — spend a limited attention budget on Scripture memory, prayer, confession, worship,
   reconciliation, service, or rest. Each choice raises specific armor *and* slows its decay for the day.
2. **The Battle** — threats arrive one at a time with four options: the right armor piece, a plausible wrong
   piece, a Scripture, or a fleshly reaction. A response timer measures your watchfulness. Freezing costs most.
3. **Evening Examen** — one act of examen (examine, gratitude, forgive, repent, review a verse), then
   neglect decay applies. Armor left unused dulls.
4. **Repeat for seven days**, then a debrief.

### Scoring

Your week is scored 0–100 on final armor average, threat block rate, Scripture precision, streaks, and
fleshly reactions — then ranked from *Called Back to the Watch* up to *Watchman of the Dawn*.

---

## Content

- **48 Scripture cards**, each tagged with the lie it answers. The sword only cuts with the *right* verse;
  a verse you have not hidden fumbles, but reveals itself so you can learn it.
- **16 threat types** across six families — Anxiety Storms, Fiery Darts, Temptation Offers, Offense Arrows,
  Distraction Fog, and Subtle Lies.
- **7 morning devotions** and **5 evening examen acts**.
- **3 difficulty modes**: New Believer, Growing Disciple, Watchman.
- **Intercession Shield** — spend charges to pray for a struggling brother or sister mid-battle. Your own
  weakest ground strengthens, and the timer freezes while you pray.
- **End-of-week debrief** with three discussion questions drawn from what actually happened in your run,
  written for youth groups and cell groups.

---

## Controls

| Key | Action |
|---|---|
| `1`–`7` | raise an armor piece |
| `A`–`D` | choose a response option |
| `Esc` | pause menu |
| `L` | scripture library |
| Click / tap | everything above |

Fully playable on touch devices; the layout reflows from desktop down to 360px wide.

---

## Project structure

```
index.html              Shell: canvas, screen layer, overlay, toast host
css/
  theme.css             Design tokens (color, type, space, motion)
  layout.css            App frame, arena, screen layer, overlays, responsive
  components.css        Buttons, panels, gauges, cards, modals, HUD, trays
js/
  main.js               Controller: run lifecycle, battle flow, wiring
  core/
    util.js             Math, random, DOM helpers
    state.js            Single serialisable state object + derived stats
    save.js             localStorage persistence (versioned, quota-safe)
  data/
    armor.js            The seven gauges
    scriptures.js       48 verses with counter-mappings
    threats.js          16 threats with targets, defenses, and narrative
    devotions.js        Morning activities + evening examen acts
    modes.js            Difficulty knobs, week length, day phases
    discussion.js       Debrief questions, ranks
  game/
    combat.js           Encounter generation and outcome resolution
    dayloop.js          Morning → battle → evening → next-day transitions
  render/
    arena.js            Canvas render loop, particles, floating text, aura
    sprites.js          Procedural believer sprite and threat shapes
    icons.js            Inline SVG icon set
  ui/
    hud.js              Readiness gauges, topbar, response tray
    screens.js          Title, mode select, manual, briefing, planner, night, debrief
    modals.js           Encounters, results, library, pause, intercession
```

No dependencies. No build step. Open and play.

---

## Design notes

- **Armor is state, not a health bar.** Each piece decays on its own schedule, and the morning plan changes
  that schedule. Neglect is modeled as slow drift, not a single punishing event.
- **Precision over volume.** Scripture options are only valid when they answer the specific lie. This is
  intentional: the game teaches that a well-aimed verse beats a hundred arguments.
- **Grace stays ahead of failure.** Blocking restores more than breaching costs on the easier modes, and every
  hard day still ends with a verse to learn. The debrief always closes on grace.
- **No assets, no network.** Everything is drawn procedurally on canvas, so the whole game is a few hundred
  kilobytes of readable source.

---

## Scripture quotations

Quotations are from the English Standard Version (ESV), used here for non-commercial educational and
devotional purposes. Check your local licensing if you redistribute this project commercially.

---

## License

MIT — see `LICENSE`.
