import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import Text from './AppText';
import {glassStyle, useTheme} from '../theme/ThemeProvider';

export default function CalendarWidgets() {
  const {colors, dark} = useTheme();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const offset = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
  const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const surface = [glassStyle(colors, dark), {padding: 10, borderRadius: 8}];
  return (
    <View
      testID="calendar-widgets"
      style={{flexDirection: 'row', gap: 8, alignItems: 'stretch'}}>
      <View
        testID="mini-month"
        style={[...surface, {width: 160}]}
        accessibilityLabel={now.toLocaleDateString(undefined, {
          month: 'long',
          year: 'numeric',
        })}>
        <Text
          style={{
            fontSize: 13,
            color: colors.text,
            textAlign: 'center',
            marginBottom: 4,
          }}>
          {now.toLocaleDateString(undefined, {month: 'long', year: 'numeric'})}
        </Text>
        <View style={{flexDirection: 'row'}}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <Text
              key={index}
              style={{
                width: '14.285714%',
                fontSize: 10,
                color: colors.muted,
                textAlign: 'center',
              }}>
              {day}
            </Text>
          ))}
        </View>
        <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
          {Array.from({length: 42}, (_, index) => {
            const day = index - offset + 1;
            const valid = day > 0 && day <= days;
            const today = valid && day === now.getDate();
            return (
              <View
                key={index}
                style={{
                  width: '14.285714%',
                  height: 17,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 4,
                  backgroundColor: today
                    ? dark
                      ? colors.accentSoft
                      : colors.accent
                    : 'transparent',
                  borderWidth: 1,
                  borderColor: today ? colors.accent : 'transparent',
                }}>
                <Text
                  accessibilityLabel={
                    today ? `Today, ${now.toLocaleDateString()}` : undefined
                  }
                  style={{
                    fontSize: 11,
                    color: today && !dark ? '#FFFFFF' : colors.text,
                    fontWeight: today ? '700' : '400',
                  }}>
                  {valid ? day : ''}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}
