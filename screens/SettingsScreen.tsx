import Text from '../components/AppText';
/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights to use, copy, modify,
 * merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import React from 'react';
import {Platform, Switch, ScrollView, View} from 'react-native';
import CalendarCanvas from '../components/CalendarCanvas';
import FlameText from '../components/FlameText';
import GlassButton from '../components/GlassButton';
import {useTheme} from '../theme/ThemeProvider';
import ThemeControl from '../components/ThemeControl';
import {fontOptions, useFont} from '../theme/FontProvider';

const SettingsScreen = () => {
  const {
    colors,
    storageError,
    showBackgroundImage,
    setShowBackgroundImage,
    backgroundStorageError,
    flameText,
    setFlameText,
  } = useTheme();
  const {font, setFont, fontScale, setFontScale, error: fontError} = useFont();
  const row = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  } as const;
  const toggle = (
    label: string,
    value: boolean,
    onValueChange: (value: boolean) => void,
  ) => (
    <Switch
      accessibilityLabel={label}
      value={value}
      onValueChange={onValueChange}
      trackColor={{false: colors.muted, true: colors.accent}}
      thumbColor={colors.surface}
      {...(Platform.OS === 'web' ? {activeThumbColor: colors.text} : {})}
    />
  );
  return (
    <CalendarCanvas style={{flex: 1}}>
      <ScrollView
        contentContainerStyle={{
          padding: 28,
          paddingLeft: Platform.OS === 'web' ? 28 : 88,
        }}>
        <View
          style={{width: '100%', maxWidth: 760, gap: 28, paddingBottom: 36}}>
          <View>
            <FlameText
              style={{color: colors.accent, fontSize: 16, fontStyle: 'italic'}}>
              PLANORAMIC
            </FlameText>
            <FlameText
              accessibilityRole="header"
              style={{color: colors.text, fontSize: 32, marginTop: 8}}>
              Settings
            </FlameText>
          </View>
          <View>
            <Text
              accessibilityRole="header"
              style={{color: colors.text, fontSize: 22}}>
              Appearance
            </Text>
            <View style={row}>
              <Text style={{color: colors.text, fontSize: 18, flex: 1}}>
                Light / dark mode
              </Text>
              <ThemeControl tooltipAlign="right" />
            </View>
            <View style={row}>
              <Text style={{color: colors.text, fontSize: 18, flex: 1}}>
                Flame text
              </Text>
              {toggle('Flame text', flameText, setFlameText)}
            </View>
            <View style={row}>
              <Text style={{color: colors.text, fontSize: 18, flex: 1}}>
                Background image
              </Text>
              {toggle(
                'Show background image',
                showBackgroundImage,
                setShowBackgroundImage,
              )}
            </View>
          </View>
          <View style={{gap: 16}}>
            <Text
              accessibilityRole="header"
              style={{color: colors.text, fontSize: 22}}>
              Typography
            </Text>
            <Text style={{color: colors.muted, fontSize: 16}}>Font</Text>
            <View
              accessibilityRole="radiogroup"
              accessibilityLabel="Font"
              style={{flexDirection: 'row', flexWrap: 'wrap', gap: 10}}>
              {fontOptions.map(option => (
                <GlassButton
                  key={option.id}
                  label={option.label}
                  radio
                  selected={font === option.id}
                  onPress={() => setFont(option.id)}
                />
              ))}
            </View>
            <View style={[row, {flexWrap: 'wrap'}]}>
              <Text style={{color: colors.text, fontSize: 18}}>Font size</Text>
              <View
                style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
                <GlassButton
                  label="Decrease font size"
                  icon="minus"
                  iconOnly
                  disabled={fontScale <= 0.9}
                  onPress={() => setFontScale(fontScale - 0.1)}
                />
                <Text
                  accessibilityLiveRegion="polite"
                  testID="font-size-value"
                  style={{
                    color: colors.text,
                    fontSize: 18,
                    minWidth: 66,
                    textAlign: 'center',
                    fontVariant: ['tabular-nums'],
                  }}>
                  {Math.round(fontScale * 100)}%
                </Text>
                <GlassButton
                  label="Increase font size"
                  icon="plus"
                  iconOnly
                  disabled={fontScale >= 1.3}
                  onPress={() => setFontScale(fontScale + 0.1)}
                />
                <GlassButton
                  label="Reset font size"
                  icon="restore"
                  iconOnly
                  disabled={fontScale === 1}
                  onPress={() => setFontScale(1)}
                />
              </View>
            </View>
          </View>
          {[backgroundStorageError, storageError, fontError]
            .filter(Boolean)
            .map((error, index) => (
              <Text
                key={index}
                accessibilityRole="alert"
                style={{color: colors.error, fontSize: 16}}>
                {error}
              </Text>
            ))}
        </View>
      </ScrollView>
    </CalendarCanvas>
  );
};

export default SettingsScreen;
