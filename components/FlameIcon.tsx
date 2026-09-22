import React from 'react';
import {Icon} from 'react-native-paper';
export type FlameIconProps = {source: string; color: string; size: number};
export default function FlameIcon(props: FlameIconProps) {
  return <Icon {...props} />;
}
