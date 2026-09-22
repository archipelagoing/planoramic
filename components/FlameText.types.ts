import {TextProps} from 'react-native';
export type FlameTextProps = TextProps & {
  neutralInDark?: boolean;
  neutral?: boolean;
  intensity?: number;
  distortion?: number;
  animationSpeed?: number;
  highlightAmount?: number;
  textureScale?: number;
};
