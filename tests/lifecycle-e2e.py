#!/usr/bin/env python3
"""Regression tests for lifecycle interruptions during a live encounter.

Covers the ways a mobile/desktop host can interrupt play: pause menu, hardware
back, backgrounding, and the interrupt-then-resume round trip. Each must leave
the battle playable, with the response timer frozen while paused.
"""
import sys
from playwright.sync_api import sync_playwright

TARGET = 'file:///workspace/project/dist/armor-of-god.html'
FAILS = []
N = [0]


def check(name, ok, detail=''):
    N[0] += 1
    if not ok:
        FAILS.append(f'{name} :: {detail}')
    print(f"{'PASS' if ok else 'FAIL'}  {name}" + (f'  -> {detail}' if detail else ''))


def to_encounter(pg):
    pg.goto(TARGET)
    pg.wait_for_timeout(700)
    pg.click('[data-act="new"]')
    pg.wait_for_timeout(300)
    pg.click('[data-mode="growing"]')
    pg.click('[data-act="start"]')
    pg.wait_for_timeout(500)
    pg.click('[data-act="plan"]')
    pg.wait_for_timeout(300)
    pg.click('[data-act="commit"]')
    pg.wait_for_timeout(800)


def main():
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 1280, 'height': 860})
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)

        # 1. Pause then resume restores the same threat
        to_encounter(pg)
        check('encounter starts with options', pg.locator('.option').count() > 0)
        title_before = pg.locator('.threat-prompt__title').inner_text()
        pg.evaluate('()=>window.__game.openPause()')
        pg.wait_for_timeout(350)
        check('pause menu opens', pg.locator('[data-m="resume"]').count() == 1)
        pg.locator('[data-m="resume"]').click()
        pg.wait_for_timeout(600)
        check('resume restores encounter', pg.locator('.option').count() > 0,
              f"{pg.locator('.option').count()} options")
        check('resume restores same threat',
              pg.locator('.threat-prompt__title').inner_text() == title_before, title_before)
        check('unpaused after resume', pg.evaluate('()=>window.__game.paused') is False)

        # 2. Timer frozen while paused
        pg.evaluate('()=>window.__game.openPause()')
        pg.wait_for_timeout(200)
        t1 = pg.evaluate('()=>window.__game.windowLeft')
        pg.wait_for_timeout(2500)
        t2 = pg.evaluate('()=>window.__game.windowLeft')
        check('timer frozen while paused', abs(t1 - t2) < 0.15, f'{t1:.2f} -> {t2:.2f}')
        pg.locator('[data-m="resume"]').click()
        pg.wait_for_timeout(400)

        # 3. Backgrounding during an encounter pauses and preserves it
        to_encounter(pg)
        pg.evaluate('()=>window.__game.onAppHidden()')
        pg.wait_for_timeout(400)
        check('background opens pause', pg.locator('[data-m="resume"]').count() == 1)
        check('background pauses game', pg.evaluate('()=>window.__game.paused') is True)
        pg.locator('[data-m="resume"]').click()
        pg.wait_for_timeout(600)
        check('encounter survives backgrounding', pg.locator('.option').count() > 0)

        # 4. Resume must let the battle continue to completion
        for _ in range(10):
            if pg.locator('.option').count() == 0:
                break
            i = pg.evaluate('()=>window.__game.currentEncounter.options.findIndex(o=>o.correct)')
            pg.locator('.option').nth(max(0, i)).click()
            pg.wait_for_timeout(650)
            c = pg.locator('[data-continue]')
            if c.count():
                c.first.click()
                pg.wait_for_timeout(650)
        check('battle progresses after interruptions',
              pg.locator('[data-act-id]').count() > 0 or pg.evaluate(
                  "()=>window.__game.screen") in ('night', 'debrief'),
              pg.evaluate('()=>window.__game.screen'))

        # 5. Pause during a result screen must be refused (it owns the only exit)
        to_encounter(pg)
        i = pg.evaluate('()=>window.__game.currentEncounter.options.findIndex(o=>o.correct)')
        pg.locator('.option').nth(max(0, i)).click()
        pg.wait_for_timeout(700)
        if pg.locator('[data-continue]').count():
            paused = pg.evaluate('()=>{window.__game.openPause(); return window.__game.paused}')
            check('pause refused during result', paused is False)
            check('result still actionable', pg.locator('[data-continue]').count() > 0)
            pg.locator('[data-continue]').first.click()
            pg.wait_for_timeout(600)

        # 6. Title-screen back must not throw
        pg.evaluate('()=>window.__game.showTitle && window.__game.showTitle()')
        pg.wait_for_timeout(400)
        check('back at title is safe',
              pg.evaluate('()=>window.__game.screen') == 'title')

        check('no errors', not errs, ' | '.join(errs[:3]))
        b.close()

    print(f"\n{N[0] - len(FAILS)}/{N[0]} checks passed")
    if FAILS:
        for f in FAILS:
            print('  -', f)
        sys.exit(1)


if __name__ == '__main__':
    main()
