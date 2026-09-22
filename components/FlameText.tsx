import React from 'react';
import Text from './AppText';
import {FlameTextProps} from './FlameText.types';
export default function FlameText({
  intensity,
  distortion,
  animationSpeed,
  highlightAmount,
  textureScale,
  neutralInDark,
  neutral,
  ...props
}: FlameTextProps) {
  return <Text {...props} />;
}
