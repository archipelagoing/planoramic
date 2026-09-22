import React from 'react';
import {View} from 'react-native';
import {fontOptions, useFont} from '../theme/FontProvider';
import {useTheme} from '../theme/ThemeProvider';
import Text from './AppText';

export default function FontControl() {
  const {font, family, setFont, error} = useFont();
  const {colors} = useTheme();
  return (
    <View style={{maxWidth: '100%'}}>
      <select
        aria-label="Font"
        value={font}
        onChange={event => setFont(event.target.value as typeof font)}
        style={{
          fontFamily: family,
          fontSize: 16,
          color: colors.text,
          background: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: 8,
          width: 210,
          maxWidth: '100%',
          height: 48,
          padding: '0 12px',
        }}>
        {fontOptions.map(item => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </select>
      {error ? (
        <Text
          accessibilityRole="alert"
          style={{color: colors.error, fontSize: 14}}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}
