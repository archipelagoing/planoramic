import React from 'react';
import GlassButton from './GlassButton';
import {useTheme} from '../theme/ThemeProvider';

export default function ThemeControl({
  tooltipAlign = 'left',
}: {
  tooltipAlign?: 'left' | 'right';
}) {
  const {dark, setMode} = useTheme();
  return (
    <GlassButton
      label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      icon="theme-light-dark"
      iconOnly
      circular
      tooltipAlign={tooltipAlign}
      onPress={() => setMode(dark ? 'light' : 'dark')}
    />
  );
}
