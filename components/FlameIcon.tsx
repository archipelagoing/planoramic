import React from 'react';
import {Icon} from 'react-native-paper';
import {useTheme} from '../theme/ThemeProvider';
export type FlameIconProps = {
  source: string;
  color: string;
  size: number;
  active?: boolean;
};
export default function FlameIcon({active, ...props}: FlameIconProps) {
  const {dark, colors} = useTheme();
  return (
    <Icon
      {...props}
      color={active ? colors.accent : colors.muted}
    />
  );
}
