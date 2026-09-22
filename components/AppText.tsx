import React from 'react';
import {Text, TextProps} from 'react-native';
import {isLoaded} from 'expo-font';

export const fonts = {
  medium: 'Montserrat_500Medium',
};

export default function AppText({style, ...props}: TextProps) {
  const family = fonts.medium;
  return (
    <Text
      {...props}
      style={[
        style,
        {
          fontFamily: isLoaded(family) ? family : undefined,
          fontWeight: 'normal',
        },
      ]}
    />
  );
}
