const { test, expect } = require('@playwright/test');

async function expectAnimation(popup, type) {
  await expect
    .poll(() => popup.evaluate((node) => node.getAnimations().map((a) => a.constructor.name)))
    .toContain(type);
  await popup.evaluate((node) => Promise.all(node.getAnimations().map((a) => a.finished)));
}

for (const strict of [false, true]) {
  test.describe(strict ? 'Strict Mode' : 'Normal mode', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(strict ? '/?strict' : '/');
      await expect(page.locator('#opener')).toBeVisible();
    });

    for (const name of ['Default', 'Custom', 'Alert', 'Responsive']) {
      test(`${name} transitions in, replaces, and transitions out`, async ({ page }) => {
        if (name === 'Responsive') await page.setViewportSize({ width: 390, height: 844 });
        await page.evaluate((name) => window.api.base.pushModal(name, { label: 'First' }), name);
        const popup = page.getByRole(name === 'Alert' ? 'alertdialog' : 'dialog', {
          name: 'First',
        });
        await expect(popup).toBeVisible();
        expect(await page.evaluate(() => window.mounts[0].starting)).toBe(true);
        await expectAnimation(popup, 'CSSTransition');

        await page.evaluate(
          (name) => window.api.base.replaceWithModal(name, { label: 'Replacement' }),
          name
        );
        const replacement = page.getByRole(name === 'Alert' ? 'alertdialog' : 'dialog', {
          name: 'Replacement',
        });
        await expect(replacement).toBeVisible();
        expect(
          await page.evaluate(
            () => window.mounts.find((m) => m.label.startsWith('Replacement')).starting
          )
        ).toBe(true);
        await expectAnimation(replacement, 'CSSTransition');
        await expect(popup).toHaveCount(0);
        await replacement.getByRole('button', { name: 'Close', exact: true }).click();
        await expectAnimation(replacement, 'CSSTransition');
        await expect(replacement).toHaveCount(0);
      });
    }

    test('factory wrapper and keyframes animate in and out', async ({ page }) => {
      await page.evaluate(() =>
        window.api.custom.pushModal('Custom', { label: 'Keyframes', animation: 'keyframe' })
      );
      const popup = page.getByRole('dialog', { name: 'Keyframes' });
      await expect(popup).toBeVisible();
      await expectAnimation(popup, 'CSSAnimation');
      await page.evaluate(() => window.api.custom.popModal());
      await expectAnimation(popup, 'CSSAnimation');
      await expect(popup).toHaveCount(0);
    });

    test('same-batch pop, popAll, and replacement never open discarded entries', async ({
      page,
    }) => {
      await page.evaluate(() => {
        const api = window.api.base;
        api.pushModal('Default', { label: 'Popped' });
        api.popModal('Default');
        api.pushModal('Custom', { label: 'Popped all' });
        api.popAllModals();
        api.pushModal('Default', { label: 'Replaced' });
        api.replaceWithModal('Custom', { label: 'Survivor' });
      });
      const survivor = page.getByRole('dialog', { name: 'Survivor' });
      await expect(survivor).toBeVisible();
      await expectAnimation(survivor, 'CSSTransition');
      expect(await page.evaluate(() => window.mounts.map((m) => m.label))).toEqual([
        'SurvivorAnimation regression fixtureClose',
      ]);
      await page.evaluate(() => window.api.base.popAllModals());
      await expect(page.getByRole('dialog')).toHaveCount(0);
      // Wait for the core's 300ms cleanup as well as any queued mount work.
      await expect.poll(() => page.locator('[data-base-ui-portal]').count()).toBe(0);
    });

    test('Escape closes the top of a stack and restores focus', async ({ page }) => {
      await page.locator('#opener').click();
      const first = page.getByRole('dialog', { name: 'Default' });
      await expectAnimation(first, 'CSSTransition');
      const closeFirst = first.getByRole('button', { name: 'Close', exact: true });
      await closeFirst.focus();
      await page.evaluate(() => window.api.base.pushModal('Custom', { label: 'Top' }));
      const top = page.getByRole('dialog', { name: 'Top' });
      await expectAnimation(top, 'CSSTransition');
      await expect(top.getByRole('button', { name: 'Close', exact: true })).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(top).toHaveCount(0);
      await expect(closeFirst).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(first).toHaveCount(0);
      await expect(page.locator('#opener')).toBeFocused();
    });

    test('unmounting a provider during opening removes the overlay', async ({ page }) => {
      await page.locator('#opener').click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.evaluate(() => window.unmountProvider());
      await expect(page.getByRole('dialog')).toHaveCount(0);
      await expect.poll(() => page.locator('[data-base-ui-portal]').count()).toBe(0);
    });

    test('Radix still animates and dismisses', async ({ page }) => {
      await page.evaluate(() => window.api.radix.pushModal('Radix', { label: 'Radix' }));
      const popup = page.getByRole('dialog', { name: 'Radix' });
      await expectAnimation(popup, 'CSSAnimation');
      await page.keyboard.press('Escape');
      await expectAnimation(popup, 'CSSAnimation');
      await expect(popup).toHaveCount(0);
    });
  });
}
