import {TextProps} from 'react-native';
export type FlameTextProps = TextProps & {
  intensity?: number;
  distortion?: number;
  animationSpeed?: number;
  highlightAmount?: number;
  textureScale?: number;
};
