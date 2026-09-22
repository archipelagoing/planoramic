import React from 'react';
import {Text, TextProps, StyleSheet} from 'react-native';
import {isLoaded} from 'expo-font';

import {useFont} from '../theme/FontProvider';

export default React.forwardRef<Text, TextProps>(function AppText(
  {style, ...props},
  ref,
) {
  const {family, fontScale} = useFont();
  const flattened = StyleSheet.flatten(style);
  const italic = flattened?.fontStyle === 'italic';
  const face = italic ? `${family}_Italic` : family;
  return (
    <Text
      ref={ref}
      {...props}
      style={[
        style,
        {
          fontFamily: isLoaded(face) ? face : undefined,
          fontStyle: isLoaded(face) ? 'normal' : italic ? 'italic' : 'normal',
          fontWeight: 'normal',
          fontSize: (flattened?.fontSize ?? 14) * fontScale,
          ...(flattened?.lineHeight
            ? {lineHeight: flattened.lineHeight * fontScale}
            : {}),
        },
      ]}
    />
  );
});
