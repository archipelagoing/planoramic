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
    <View
      style={{
        position: 'relative',
        maxWidth: '100%',
        zIndex: hovered || focused ? 30 : 0,
      }}>
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
        <div
          role="tooltip"
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 6px)',
            [tooltipAlign]: 0,
            backgroundColor: dark
              ? 'rgba(24,23,22,0.12)'
              : 'rgba(255,255,255,0.12)',
            padding: '3px 6px',
            borderRadius: 4,
            pointerEvents: 'none',
            zIndex: 30,
            width: 'max-content',
            maxWidth: 180,
          }}>
          <Text numberOfLines={1} style={{color: colors.text, fontSize: 11}}>
            {label}
          </Text>
        </div>
      )}
    </View>
  );
}
