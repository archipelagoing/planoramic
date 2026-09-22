import React from 'react';
import {View} from 'react-native';
import GlassButton from './GlassButton';
import {ThemeMode, useTheme} from '../theme/ThemeProvider';

const modes: {value: ThemeMode; label: string; icon: string}[] = [
  {value: 'light', label: 'Light theme', icon: 'white-balance-sunny'},
  {value: 'dark', label: 'Dark theme', icon: 'weather-night'},
  {value: 'system', label: 'System theme', icon: 'theme-light-dark'},
];
export default function ThemeControl() {
  const {mode, setMode} = useTheme();
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel="Appearance"
      style={{flexDirection: 'row', gap: 6, zIndex: 10}}>
      {modes.map(item => (
        <GlassButton
          key={item.value}
          label={item.label}
          icon={item.icon}
          iconOnly
          circular
          radio
          selected={mode === item.value}
          onPress={() => setMode(item.value)}
        />
      ))}
    </View>
  );
}
