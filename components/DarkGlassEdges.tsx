import React from 'react';
import {Platform, View, ViewStyle} from 'react-native';

export const darkGlassFocus: ViewStyle = {
  zIndex: 2,
  ...(Platform.OS === 'web'
    ? {outline: '2px solid #FFF0F2', outlineOffset: 2}
    : {borderColor: '#FFF0F2'}),
};

export const darkGlassCard: ViewStyle = {
  backgroundColor: 'rgba(255,255,255,0.08)',
  borderRadius: 20,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.3)',
  position: 'relative',
  overflow: 'hidden',
  ...(Platform.OS === 'web'
    ? {
        backgroundImage: 'none',
        backdropFilter: 'blur(15px)',
        WebkitBackdropFilter: 'blur(15px)',
        boxShadow:
          '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 0 rgba(255,255,255,0.1), inset 0 0 14px 7px rgba(255,255,255,0.7)',
      }
    : {}),
};

export default function DarkGlassEdges() {
  const top: ViewStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    ...(Platform.OS === 'web'
      ? {
          backgroundImage:
            'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
        }
      : {backgroundColor: 'rgba(255,255,255,0.8)'}),
  };
  const left: ViewStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 1,
    height: '100%',
    ...(Platform.OS === 'web'
      ? {
          backgroundImage:
            'linear-gradient(180deg, rgba(255,255,255,0.8), transparent, rgba(255,255,255,0.3))',
        }
      : {backgroundColor: 'rgba(255,255,255,0.3)'}),
  };
  return (
    <>
      <View pointerEvents="none" style={top} />
      <View pointerEvents="none" style={left} />
    </>
  );
}
