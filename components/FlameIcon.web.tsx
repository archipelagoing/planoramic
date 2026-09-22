import React, {useEffect, useRef} from 'react';
import {Text} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {attachFlameText} from '../backend/public/flame-text';
import {useTheme} from '../theme/ThemeProvider';
import {FlameIconProps} from './FlameIcon';

const glyphs = MaterialCommunityIcons.getRawGlyphMap();
export default function FlameIcon({
  source,
  color,
  size,
  active = false,
}: FlameIconProps) {
  const ref = useRef<Text>(null);
  const {flameText, dark, colors} = useTheme();
  const code = glyphs[source as keyof typeof glyphs] || glyphs['help-circle'];
  useEffect(() => {
    if (!flameText || !active || !ref.current) return;
    return attachFlameText(ref.current as unknown as HTMLElement, {
      dark,
      textureScale: 0.65,
    });
  }, [flameText, dark, active, code, size]);
  return (
    <Text
      ref={ref}
      testID="flame-icon"
      accessible={false}
      aria-hidden
      style={{
        fontFamily: 'material-community',
        fontSize: size,
        lineHeight: size + 4,
        width: size + 4,
        height: size + 4,
        color: active ? colors.accent : colors.muted,
        textAlign: 'center',
        flexShrink: 0,
      }}>
      {typeof code === 'number' ? String.fromCodePoint(code) : code}
    </Text>
  );
}
