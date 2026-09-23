// Shared procedural color field. Glyph outlines are masked at device resolution.
export const flameDefaults = Object.freeze({
  intensity: 0.85,
  distortion: 0.8,
  animationSpeed: 0,
  highlightAmount: 0.075,
  textureScale: 1,
});
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const smooth = t => t * t * (3 - 2 * t);
const palette = [
  '#160603',
  '#6E1605',
  '#B63308',
  '#ED6B0A',
  '#FF9D18',
  '#FFC044',
  '#FFE08A',
  '#FFF0B5',
].map(hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)));
const darkPalette = [
  '#7A2108',
  '#7A2108',
  '#B83B08',
  '#E9630B',
  '#F79A22',
  '#F79A22',
  '#F6C56A',
  '#FFE3A0',
].map(hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)));
const lightPalette = [
  '#7A1D0B',
  '#7A1D0B',
  '#A82A0D',
  '#A82A0D',
  '#D6410C',
  '#D6410C',
  '#EF650D',
  '#F49A28',
].map(hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)));

export function flameColor(x, y, time, options = {}) {
  const p = {...flameDefaults, ...options};
  const scale = clamp(p.textureScale, 0.25, 4);
  x /= scale;
  y = y / scale - time * 0.035;
  const bend =
    clamp(p.distortion, 0, 2) *
    (0.75 * Math.sin(y * 1.9 + x * 0.31) +
      0.36 * Math.sin(y * 3.1 - x * 0.47 + 1.4));
  const phase = x * 3.7 + bend + 0.24 * Math.sin(x * 1.13 + y * 0.8);
  const wave = 0.5 + 0.5 * Math.sin(phase);
  const highlight = clamp(p.highlightAmount, 0, 0.2);
  const hot = Math.pow(wave, 3.5);
  const modulation = 0.5 + 0.5 * Math.sin(x * 0.73 - y * 1.1 + 1);
  let value = 0.28 + 0.43 * wave + 0.19 * hot * modulation;
  const ribbon = Math.exp(
    -Math.pow((wave - 0.9) / Math.max(0.001, highlight * 0.35), 2),
  );
  value += highlight === 0 ? 0 : 0.32 * ribbon * (0.65 + 0.35 * modulation);
  value = clamp(0.55 + (value - 0.55) * clamp(p.intensity, 0, 1.5), 0, 1);
  const stops = [0, 0.14, 0.28, 0.4, 0.56, 0.72, 0.86, 1];
  let i = 0;
  while (i < stops.length - 2 && value > stops[i + 1]) i++;
  const t = smooth(clamp((value - stops[i]) / (stops[i + 1] - stops[i]), 0, 1));
  const colors = p.dark
    ? darkPalette
    : p.dark === false
      ? lightPalette
      : palette;
  return colors[i].map((v, channel) =>
    Math.round(v + (colors[i + 1][channel] - v) * t),
  );
}

export function attachFlameText(element, options = {}) {
  const config = {...flameDefaults, ...options};
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return () => {};
  canvas.setAttribute('aria-hidden', 'true');
  canvas.dataset.flameCanvas = 'true';
  Object.assign(canvas.style, {
    position: 'absolute',
    inset: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  });
  const previous = {
    position: element.style.position,
    fill: element.style.webkitTextFillColor,
  };
  if (getComputedStyle(element).position === 'static')
    element.style.position = 'relative';
  element.append(canvas);
  let disposed = false;
  let frame = 0;
  let last = -Infinity;
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const origin = performance.now();

  function draw(time = 0) {
    if (disposed) return;
    const box = element.getBoundingClientRect();
    if (!box.width || !box.height) return;
    const style = getComputedStyle(element);
    const size = parseFloat(style.fontSize);
    const dpr = Math.min(devicePixelRatio || 1, 3);
    canvas.width = Math.ceil(box.width * dpr);
    canvas.height = Math.ceil(box.height * dpr);
    // Smooth fields need fewer samples than the sharp glyph mask.
    const field = document.createElement('canvas');
    field.width = Math.max(1, Math.min(512, Math.ceil(box.width / 2)));
    field.height = Math.max(1, Math.min(192, Math.ceil(box.height / 2)));
    const paint = field.getContext('2d');
    const pixels = paint.createImageData(field.width, field.height);
    for (let y = 0; y < field.height; y++) {
      for (let x = 0; x < field.width; x++) {
        const color = flameColor(
          ((x / field.width) * box.width) / size,
          ((y / field.height) * box.height) / size,
          time,
          config,
        );
        const offset = (y * field.width + x) * 4;
        pixels.data.set([...color, 255], offset);
      }
    }
    paint.putImageData(pixels, 0, 0);
    context.imageSmoothingQuality = 'high';
    context.drawImage(field, 0, 0, canvas.width, canvas.height);
    const font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    context.font = font;
    const ascent = context.measureText('Hg').fontBoundingBoxAscent;
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const lines = [];
    let node;
    while ((node = walker.nextNode())) {
      for (let i = 0; i < node.textContent.length; i++) {
        const range = document.createRange();
        range.setStart(node, i);
        range.setEnd(node, i + 1);
        const rect = range.getBoundingClientRect();
        if (!rect.height) continue;
        let line = lines.find(item => Math.abs(item.top - rect.top) < 1);
        if (!line) {
          line = {top: rect.top, left: rect.left, text: ''};
          lines.push(line);
        }
        line.text += node.textContent[i];
      }
    }
    // A single mask preserves every wrapped line and leaves no colored rectangle.
    const mask = document.createElement('canvas');
    mask.width = canvas.width;
    mask.height = canvas.height;
    const ink = mask.getContext('2d');
    if (!ink || !Number.isFinite(ascent)) {
      canvas.hidden = true;
      element.style.webkitTextFillColor = previous.fill;
      return;
    }
    ink.scale(dpr, dpr);
    ink.font = font;
    ink.fillStyle = '#fff';
    for (const line of lines)
      ink.fillText(
        line.text,
        line.left - box.left,
        line.top - box.top + ascent,
      );
    context.globalCompositeOperation = 'destination-in';
    context.drawImage(mask, 0, 0);
    context.globalCompositeOperation = 'source-over';
    canvas.hidden = false;
    element.style.webkitTextFillColor = 'transparent';
  }
  function tick(now) {
    if (
      disposed ||
      media.matches ||
      document.hidden ||
      config.animationSpeed <= 0
    )
      return;
    if (now - last >= 120) {
      draw(((now - origin) / 1000) * clamp(config.animationSpeed, 0, 2));
      last = now;
    }
    frame = requestAnimationFrame(tick);
  }
  function refresh() {
    cancelAnimationFrame(frame);
    draw();
    if (!media.matches && !document.hidden && config.animationSpeed > 0)
      frame = requestAnimationFrame(tick);
  }
  const resize = new ResizeObserver(refresh);
  resize.observe(element);
  media.addEventListener('change', refresh);
  document.addEventListener('visibilitychange', refresh);
  document.fonts.addEventListener('loadingdone', refresh);
  document.fonts.ready.then(() => {
    if (!disposed) refresh();
  });
  refresh();
  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    resize.disconnect();
    media.removeEventListener('change', refresh);
    document.removeEventListener('visibilitychange', refresh);
    document.fonts.removeEventListener('loadingdone', refresh);
    canvas.remove();
    element.style.position = previous.position;
    element.style.webkitTextFillColor = previous.fill;
  };
}
