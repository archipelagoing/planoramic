import React, {useEffect, useRef} from 'react';
import {Text as NativeText} from 'react-native';
import Text from './AppText';
import {useTheme} from '../theme/ThemeProvider';
import {useFont} from '../theme/FontProvider';
import {attachFlameText} from '../backend/public/flame-text';
import {FlameTextProps} from './FlameText.types';

export default function FlameText({
  intensity = 0.85,
  distortion = 0.8,
  animationSpeed = 0,
  highlightAmount = 0.075,
  textureScale = 1,
  neutralInDark = false,
  neutral = false,
  ...props
}: FlameTextProps) {
  const ref = useRef<NativeText>(null);
  const {flameText, dark} = useTheme();
  const {family, fontScale} = useFont();
  useEffect(() => {
    if (!flameText || neutral || (dark && neutralInDark) || !ref.current)
      return;
    return attachFlameText(ref.current as unknown as HTMLElement, {
      intensity,
      distortion,
      animationSpeed,
      highlightAmount,
      textureScale,
      dark,
    });
  }, [
    flameText,
    dark,
    neutralInDark,
    neutral,
    family,
    fontScale,
    props.children,
    intensity,
    distortion,
    animationSpeed,
    highlightAmount,
    textureScale,
  ]);
  return <Text {...props} ref={ref} />;
}
