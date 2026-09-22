import {test, expect} from '@playwright/test';

test('procedural flame parameters, masking, motion and cleanup', async ({
  page,
}, testInfo) => {
  await page.goto('/connect');
  await page.evaluate(() => document.fonts.ready);
  const result = await page.evaluate(async () => {
    const path = '/connect-assets/flame-text.js';
    const {attachFlameText, flameColor} = await import(path);
    let hot = 0;
    for (let y = 0; y < 100; y++)
      for (let x = 0; x < 1000; x++) {
        const c = flameColor(x / 100, y / 100, 0);
        if (c[0] > 250 && c[1] > 215 && c[2] > 125) hot++;
      }
    const target = document.createElement('h2');
    target.id = 'flame-specimen';
    target.textContent = 'Planoramic';
    Object.assign(target.style, {
      fontFamily: 'Montserrat',
      fontWeight: '500',
      fontSize: '80px',
      width: '100%',
      margin: '20px 0',
      lineHeight: '1.2',
    });
    document.querySelector('main').prepend(target);
    const render = (options = {}) => {
      const cleanup = attachFlameText(target, options);
      const data = target.querySelector('canvas').toDataURL();
      cleanup();
      return data;
    };
    const baseline = render();
    const changed = [
      {intensity: 0.3},
      {distortion: 0},
      {highlightAmount: 0},
      {textureScale: 2},
    ].map(options => render(options) !== baseline);
    const restored =
      target.style.webkitTextFillColor === '' &&
      !target.querySelector('canvas');
    window.stopFlame = attachFlameText(target, {animationSpeed: 1});
    return {hot: hot / 100000, changed, restored};
  });
  expect(result.hot).toBeGreaterThan(0.05);
  expect(result.hot).toBeLessThan(0.1);
  expect(result.changed).toEqual([true, true, true, true]);
  expect(result.restored).toBe(true);
  const canvas = page.locator('#flame-specimen canvas');
  const snapshot = () => canvas.evaluate(node => node.toDataURL());
  const first = await snapshot();
  await expect.poll(snapshot).not.toBe(first);
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.waitForTimeout(200);
  const still = await snapshot();
  await page.waitForTimeout(400);
  expect(await snapshot()).toBe(still);
  await page.screenshot({
    path: testInfo.outputPath('large-type.png'),
    fullPage: true,
  });
  await page.evaluate(() => window.stopFlame());
  await expect(canvas).toHaveCount(0);
});
