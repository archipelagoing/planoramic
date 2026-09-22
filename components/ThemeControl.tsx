import React from 'react';
import GlassButton from './GlassButton';
import {useTheme} from '../theme/ThemeProvider';

export default function ThemeControl() {
  const {dark, setMode} = useTheme();
  return (
    <GlassButton
      label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      icon="theme-light-dark"
      iconOnly
      circular
      tooltipAlign="left"
      onPress={() => setMode(dark ? 'light' : 'dark')}
    />
  );
}
