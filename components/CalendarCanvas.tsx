import React from 'react';
import {
  Image,
  SafeAreaView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import {useTheme} from '../theme/ThemeProvider';

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
        testID="fireplace-background"
        source={require('../assets/images/fireplace1.png')}
        resizeMode="cover"
        accessible={false}
        style={[StyleSheet.absoluteFillObject, {width: '100%', height: '100%'}]}
      />
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          {
            backgroundColor: dark
              ? 'rgba(14,10,12,0.48)'
              : 'rgba(246,245,245,0.80)',
          },
        ]}
      />
      <SafeAreaView style={style}>{children}</SafeAreaView>
    </View>
  );
}
