import React from 'react';
import {useTheme} from '../theme/ThemeProvider';
import {useFont} from '../theme/FontProvider';

export default function FlameControl() {
  const {flameText, setFlameText, colors} = useTheme();
  const {family} = useFont();
  return (
    <label
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        minHeight: 48,
        color: colors.text,
        fontFamily: family,
        fontSize: 16,
        cursor: 'pointer',
      }}>
      <input
        type="checkbox"
        checked={flameText}
        onChange={event => setFlameText(event.target.checked)}
        style={{accentColor: colors.accent, width: 18, height: 18}}
      />
      Flame text
    </label>
  );
}
