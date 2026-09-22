import React from 'react';
import {
  Image,
  Platform,
  SafeAreaView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import {useTheme, pearlImageStyle} from '../theme/ThemeProvider';

export default function CalendarCanvas({
  children,
  style,
}: {
  children: React.ReactNode;
  style: StyleProp<ViewStyle>;
}) {
  const {colors, dark} = useTheme();
  return (
    <View style={{flex: 1, backgroundColor: colors.background}}>
      <Image
        testID="calendar-background"
        source={require('../assets/images/frosted1.png')}
        resizeMode="cover"
        accessible={false}
        style={[
          StyleSheet.absoluteFillObject,
          {width: '100%', height: '100%'},
          !dark && Platform.OS === 'web' && pearlImageStyle,
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          {
            backgroundColor: dark
              ? 'rgba(14,10,12,0.48)'
              : 'rgba(248,245,241,0.68)',
          },
        ]}
      />
      <SafeAreaView style={style}>{children}</SafeAreaView>
    </View>
  );
}
