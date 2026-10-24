import React, {useState} from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';

export const palette = {
  background: '#18251F',
  card: '#24372B',
  button: '#304237',
  focus: '#435E4C',
  text: '#F8F0E4',
  muted: '#B9C5BB',
  accent: '#E4BC87',
  error: '#FFBEAC',
};

export function TVButton({
  label,
  onPress,
  preferred = false,
  disabled = false,
  selected = false,
}: {
  label: string;
  onPress: () => void;
  preferred?: boolean;
  disabled?: boolean;
  selected?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{disabled, selected}}
      hasTVPreferredFocus={preferred}
      disabled={disabled}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onPress={onPress}
      style={[
        styles.button,
        selected && styles.selected,
        focused && styles.focus,
        disabled && styles.disabled,
      ]}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  button: {
    backgroundColor: palette.button,
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 3,
    borderColor: 'transparent',
    marginVertical: 4,
  },
  label: {color: palette.text, fontSize: 17, fontWeight: '600'},
  selected: {backgroundColor: '#3A5040'},
  focus: {borderColor: palette.accent, backgroundColor: palette.focus},
  disabled: {opacity: 0.6},
});
