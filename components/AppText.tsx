import React from 'react';
import {Text, TextProps} from 'react-native';
import {isLoaded} from 'expo-font';

import {useFont} from '../theme/FontProvider';

export default React.forwardRef<Text, TextProps>(function AppText(
  {style, ...props},
  ref,
) {
  const {family} = useFont();
  return (
    <Text
      ref={ref}
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
});
