import Text from './AppText';
import React, {useState} from 'react';
import {Platform, Pressable, View} from 'react-native';
import {Icon} from 'react-native-paper';
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
}: {
  label: string;
  icon?: string;
  onPress: () => void;
  disabled?: boolean;
  iconOnly?: boolean;
  selected?: boolean;
  radio?: boolean;
  circular?: boolean;
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
            minHeight: 48,
            minWidth: 48,
            maxWidth: '100%',
            paddingHorizontal: iconOnly ? 12 : 18,
            paddingVertical: 12,
            borderRadius: circular ? 24 : 14,
            ...(circular
              ? {
                  width: 48,
                  height: 48,
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
          focused && {
            borderWidth: 3,
            paddingHorizontal: circular ? 0 : iconOnly ? 10 : 16,
            paddingVertical: circular ? 0 : 10,
          },
          focusStyle(colors, dark, focused, reduceMotion),
        ]}>
        {!circular && (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: 1,
              left: 10,
              right: 10,
              height: 1,
              backgroundColor: dark
                ? 'rgba(255,255,255,0.45)'
                : 'rgba(255,255,255,0.95)',
            }}
          />
        )}
        {icon && <Icon source={icon} color={colors.accent} size={22} />}
        {!iconOnly && (
          <Text
            style={{
              color: colors.text,
              fontSize: 18,
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
            right: 0,
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
