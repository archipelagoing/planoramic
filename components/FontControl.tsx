import React, {useState} from 'react';
import {Modal, View, ScrollView} from 'react-native';
import {fontOptions, useFont} from '../theme/FontProvider';
import {useTheme} from '../theme/ThemeProvider';
import GlassButton from './GlassButton';
import Text from './AppText';

export default function FontControl() {
  const [open, setOpen] = useState(false);
  const {font, setFont, error} = useFont();
  const {colors} = useTheme();
  return (
    <>
      <GlassButton
        label="Font"
        icon="format-font"
        iconOnly
        onPress={() => setOpen(true)}
      />
      <Modal visible={open} transparent onRequestClose={() => setOpen(false)}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}>
          <ScrollView
            style={{
              width: 360,
              maxWidth: '100%',
              maxHeight: '90%',
              backgroundColor: colors.surface,
              borderRadius: 8,
            }}
            contentContainerStyle={{padding: 24, gap: 12}}>
            {fontOptions.map(item => (
              <GlassButton
                key={item.id}
                label={item.label}
                radio
                selected={font === item.id}
                onPress={() => setFont(item.id)}
              />
            ))}
            {error ? <Text style={{color: colors.error}}>{error}</Text> : null}
            <GlassButton
              label="Close"
              icon="close"
              onPress={() => setOpen(false)}
            />
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}
