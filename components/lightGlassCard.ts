import {Platform, ViewStyle} from 'react-native';

// Event-card material only; layout and focus styling remain with the caller.
export const lightGlassCard: ViewStyle = {
  backgroundColor: 'rgba(255,255,255,0.17)',
  borderColor: 'rgba(255,255,255,0.45)',
  ...(Platform.OS === 'web'
    ? {
        backgroundColor: 'transparent',
        backgroundImage:
          'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.05) 28%, transparent 62%), linear-gradient(135deg, rgba(255,255,255,0.24), rgba(255,255,255,0.10))',
        backdropFilter: 'blur(8px) saturate(120%) brightness(1.04)',
        WebkitBackdropFilter: 'blur(8px) saturate(120%) brightness(1.04)',
        boxShadow:
          '0 10px 30px rgba(40,30,25,0.06), inset 0 1px 0 rgba(255,255,255,0.65), inset 1px 0 0 rgba(255,255,255,0.12)',
      }
    : {}),
};
