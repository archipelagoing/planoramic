import React from 'react';
import {Switch, View} from 'react-native';
import Text from './AppText';
import {useTheme} from '../theme/ThemeProvider';

export default function ThemeControl() {
  const {dark, setMode, colors} = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        maxWidth: '100%',
      }}>
      <Text style={{color: colors.text, fontSize: 16}}>Dark mode</Text>
      <Switch
        accessibilityLabel="Dark mode"
        value={dark}
        onValueChange={value => setMode(value ? 'dark' : 'light')}
        trackColor={{false: colors.muted, true: colors.accent}}
        thumbColor={colors.surface}
      />
    </View>
  );
}
