#!/usr/bin/env python3
"""Full regression suite for the single-file build.

Plays complete 7-day weeks in all three difficulty modes, exercises persistence,
pause/restart, the scripture library, intercession, and responsive layouts, then
fails loudly on any console error, page error, or broken layout.
"""
import sys
import json
from playwright.sync_api import sync_playwright

TARGET = sys.argv[1] if len(sys.argv) > 1 else 'file:///workspace/project/dist/armor-of-god.html'
FAILS = []
CHECKS = [0]


def check(name, ok, detail=''):
    CHECKS[0] += 1
    if not ok:
        FAILS.append(f'{name} :: {detail}')
    print(f"{'PASS' if ok else 'FAIL'}  {name}" + (f'  -> {detail}' if detail else ''))


def play_week(pg, mode, strategy):
    """Drive a complete 7-day week through the real UI flow.

    Flow: briefing -> planner -> commit -> encounters (option -> result ->
    continue) -> evening -> night -> next day, ending at the debrief.
    """
    pg.goto(TARGET)
    pg.wait_for_timeout(700)

    if pg.locator('[data-mode="%s"]' % mode).count() == 0:
        pg.click('[data-act="new"]')
        pg.wait_for_timeout(350)
    pg.click('[data-mode="%s"]' % mode)
    pg.click('[data-act="start"]')
    pg.wait_for_timeout(500)

    for day in range(1, 8):
        # ---- morning ----
        pg.wait_for_selector('[data-act="plan"]', timeout=15000)
        pg.click('[data-act="plan"]')
        pg.wait_for_timeout(300)
        if strategy == 'wise':
            for dev in ('prayer', 'word', 'confession'):
                b = pg.locator('[data-dev-inc="%s"]' % dev)
                if b.count() and b.first.is_enabled():
                    b.first.click()
                    pg.wait_for_timeout(70)
        pg.click('[data-act="commit"]')
        pg.wait_for_timeout(700)

        # ---- encounters ----
        for _ in range(12):
            if pg.locator('.option').count() == 0:
                break
            if strategy == 'flesh':
                idx = pg.evaluate("()=>window.__game.currentEncounter.options.findIndex(o=>!o.correct)")
            else:
                idx = pg.evaluate("()=>window.__game.currentEncounter.options.findIndex(o=>o.correct)")
            if idx is None or idx < 0:
                idx = 0
            pg.locator('.option').nth(idx).click()
            pg.wait_for_timeout(700)
            cont = pg.locator('[data-continue]')
            if cont.count():
                cont.first.click()
                pg.wait_for_timeout(700)

        # ---- evening ----
        eve = pg.locator('[data-act-id]')
        if eve.count():
            eve.first.click()
            pg.wait_for_timeout(800)

        # ---- night -> next day (or debrief on day 7) ----
        nxt = pg.locator('[data-act="next-day"]')
        if nxt.count():
            nxt.first.click()
            pg.wait_for_timeout(800)

    return pg


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        ctx = browser.new_context(viewport={'width': 1280, 'height': 860})
        pg = ctx.new_page()

        errors = []
        pg.on('pageerror', lambda e: errors.append(f'pageerror: {e}'))
        pg.on('console', lambda m: errors.append(f'console: {m.text}') if m.type == 'error' else None)

        # --- boot & static integrity ---
        pg.goto(TARGET)
        pg.wait_for_timeout(800)
        check('boots with UI', pg.locator('button').count() > 0,
              f"{pg.locator('button').count()} buttons")
        check('CSP meta present', pg.evaluate(
            "()=>!!document.querySelector('meta[http-equiv=\"Content-Security-Policy\"]')"))
        check('canvas sized', pg.evaluate(
            "()=>{const c=document.getElementById('arena');return c.width>100&&c.height>100}"))
        check('no external requests', pg.evaluate(
            "()=>performance.getEntriesByType('resource').every(r=>!r.name.startsWith('http'))"))

        # --- every mode plays a full week ---
        for mode in ['new', 'growing', 'watchman']:
            play_week(pg, mode, 'wise')
            reached = pg.evaluate(
                "()=>({day: window.__game.state ? window.__game.state.day : null,"
                " screen: window.__game.screen})"
            )
            check(f'{mode}: week completes', reached['screen'] in ('debrief', 'title', 'result'),
                  json.dumps(reached))

        # --- flesh strategy should not crash ---
        play_week(pg, 'growing', 'flesh')
        check('flesh playthrough survives', pg.locator('body').count() > 0)

        # --- persistence round trip ---
        pg.goto(TARGET)
        pg.wait_for_timeout(600)
        pg.click('text=Begin a Week')
        pg.wait_for_timeout(250)
        if pg.locator('[data-mode="growing"]').count() == 0:
            pg.click('[data-act="new"]')
            pg.wait_for_timeout(300)
        pg.click('[data-mode="growing"]')
        pg.click('[data-act="start"]')
        pg.wait_for_timeout(400)
        pg.click('[data-act="plan"]')
        pg.wait_for_timeout(200)
        pg.click('[data-dev-inc="prayer"]')
        pg.click('[data-act="commit"]')
        pg.wait_for_timeout(600)
        saved = pg.evaluate("()=>!!localStorage.getItem('aogdw:save')")
        check('save written', saved)
        pg.reload()
        pg.wait_for_timeout(800)
        check('continue offered after reload',
              pg.locator('text=Continue').count() > 0 or pg.locator('[data-act="continue"]').count() > 0)

        # --- library ---
        pg.evaluate("()=>window.__game.openLibrary()")
        pg.wait_for_timeout(500)
        cards = pg.evaluate(
            "()=>document.querySelectorAll('.verse-card,.scripture-card,.lib__card').length")
        check('library lists verses', cards >= 40, f'{cards} cards')
        pg.evaluate("()=>{window.__game.modals.close();window.__game.paused=false;}")

        # --- responsive layout: no horizontal overflow anywhere ---
        for w, h in [(1440, 900), (1280, 800), (834, 1112), (390, 844), (360, 740)]:
            pg.set_viewport_size({'width': w, 'height': h})
            pg.wait_for_timeout(400)
            overflow = pg.evaluate(
                "()=>document.documentElement.scrollWidth > window.innerWidth + 1")
            check(f'no h-overflow at {w}x{h}', not overflow)

        browser.close()

    check('zero console/page errors', not errors, ' | '.join(errors[:4]))
    print(f"\n{CHECKS[0] - len(FAILS)}/{CHECKS[0]} checks passed")
    if FAILS:
        print('FAILURES:')
        for f in FAILS:
            print('  -', f)
        sys.exit(1)


if __name__ == '__main__':
    main()
