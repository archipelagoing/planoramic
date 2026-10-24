import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {palette} from './ui';

export function Clock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const hour = (now.getHours() % 12) * 30 + now.getMinutes() / 2;
  const minute = now.getMinutes() * 6 + now.getSeconds() / 10;
  return (
    <View style={styles.container}>
      <View style={styles.face} accessible={false}>
        {Array.from({length: 12}, (_, index) => {
          const angle = (index * Math.PI) / 6;
          return (
            <View
              key={index}
              style={[
                styles.mark,
                {
                  left: 31 + Math.sin(angle) * 26,
                  top: 31 - Math.cos(angle) * 26,
                },
              ]}
            />
          );
        })}
        <View
          style={[
            StyleSheet.absoluteFill,
            {transform: [{rotate: `${hour}deg`}]},
          ]}>
          <View style={styles.hour} />
        </View>
        <View
          style={[
            StyleSheet.absoluteFill,
            {transform: [{rotate: `${minute}deg`}]},
          ]}>
          <View style={styles.minute} />
        </View>
        <View style={styles.center} />
      </View>
      <View>
        <Text style={styles.digital}>
          {now.toLocaleTimeString(undefined, {
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
          })}
        </Text>
        <Text style={styles.date}>
          {now.toLocaleDateString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          })}
        </Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {flexDirection: 'row', alignItems: 'center', gap: 12},
  face: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: palette.accent,
    backgroundColor: palette.card,
  },
  mark: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: palette.accent,
  },
  hour: {
    position: 'absolute',
    width: 4,
    height: 17,
    top: 15,
    left: 29,
    borderRadius: 2,
    backgroundColor: palette.text,
  },
  minute: {
    position: 'absolute',
    width: 2,
    height: 24,
    top: 8,
    left: 30,
    borderRadius: 1,
    backgroundColor: palette.accent,
  },
  center: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    left: 28,
    top: 28,
    backgroundColor: palette.accent,
  },
  digital: {color: palette.text, fontSize: 25, fontVariant: ['tabular-nums']},
  date: {color: palette.muted, fontSize: 14, marginTop: 5},
});
