import React from 'react';
import {Platform, ScrollView, View} from 'react-native';
import CalendarCanvas from './CalendarCanvas';
import FlameText from './FlameText';
import Text from './AppText';
import ThemeControl from './ThemeControl';
import {useTheme} from '../theme/ThemeProvider';

export default function WorkspacePage({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const {colors} = useTheme();
  return (
    <CalendarCanvas style={{flex: 1}}>
      <ScrollView
        contentContainerStyle={{
          padding: 28,
          paddingLeft: Platform.OS === 'web' ? 28 : 88,
          gap: 28,
        }}>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            gap: 20,
          }}>
          <View style={{flexShrink: 1}}>
            <FlameText
              style={{color: colors.accent, fontSize: 16, fontStyle: 'italic'}}>
              PLANORAMIC
            </FlameText>
            <FlameText
              accessibilityRole="header"
              style={{color: colors.text, fontSize: 32, marginVertical: 8}}>
              {title}
            </FlameText>
            <Text
              style={{color: colors.muted, fontSize: 18, fontStyle: 'italic'}}>
              {subtitle}
            </Text>
          </View>
          <ThemeControl />
        </View>
        {children}
      </ScrollView>
    </CalendarCanvas>
  );
}
