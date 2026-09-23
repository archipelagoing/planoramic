import Text from './AppText';
import React, {useState} from 'react';
import {Platform, Pressable, View} from 'react-native';
import Icon from './FlameIcon';
import {focusStyle, glassStyle, useTheme} from '../theme/ThemeProvider';

export default function GlassButton({
  label,
  icon,
  onPress,
  disabled = false,
  iconOnly = false,
  selected,
  radio = false,
  circular = false,
  tooltipAlign = 'right',
  compact = false,
}: {
  label: string;
  icon?: string;
  onPress: () => void;
  disabled?: boolean;
  iconOnly?: boolean;
  selected?: boolean;
  radio?: boolean;
  circular?: boolean;
  tooltipAlign?: 'left' | 'right';
  compact?: boolean;
}) {
  const {colors, dark, reduceMotion} = useTheme();
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  return (
    <View style={{position: 'relative', maxWidth: '100%'}}>
      <Pressable
        accessibilityRole={radio ? 'radio' : 'button'}
        accessibilityLabel={label}
        accessibilityState={{disabled, ...(radio ? {checked: selected} : {})}}
        aria-checked={radio ? selected : undefined}
        disabled={disabled}
        onPress={onPress}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        style={({pressed}) => [
          {
            ...glassStyle(
              colors,
              dark,
              Boolean(selected || hovered || pressed || focused),
            ),
            minHeight: compact ? 32 : 48,
            minWidth: compact ? 32 : 48,
            maxWidth: '100%',
            paddingHorizontal: compact ? 10 : iconOnly ? 12 : 18,
            paddingVertical: compact ? 5 : 12,
            borderRadius: circular ? (compact ? 16 : 24) : compact ? 8 : 14,
            ...(circular
              ? {
                  width: compact ? 32 : 48,
                  height: compact ? 32 : 48,
                  paddingHorizontal: 0,
                  paddingVertical: 0,
                }
              : {}),
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            opacity: disabled ? 0.5 : 1,
          },
          focusStyle(colors, dark, focused, reduceMotion),
        ]}>
        {icon && (
          <Icon
            source={icon}
            color={colors.accent}
            size={compact ? 17 : 22}
            active={Boolean(selected)}
          />
        )}
        {!iconOnly && (
          <Text
            style={{
              color: colors.text,
              fontSize: compact ? 14 : 18,
              fontWeight: '600',
              flexShrink: 1,
            }}>
            {label}
          </Text>
        )}
      </Pressable>
      {iconOnly && (hovered || focused) && Platform.OS === 'web' && (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 54,
            [tooltipAlign]: 0,
            backgroundColor: colors.surface,
            padding: 8,
            borderRadius: 6,
            borderWidth: 1,
            borderColor: colors.border,
            zIndex: 20,
            width: 100,
          }}>
          <Text style={{color: colors.text, fontSize: 13}}>{label}</Text>
        </View>
      )}
    </View>
  );
}
