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
import {StyleSheet, SafeAreaView, Switch, ScrollView} from 'react-native';
import {Header} from '../components';
import {useTheme} from '../theme/ThemeProvider';
import ThemeControl from '../components/ThemeControl';
import FontControl from '../components/FontControl';
import FlameControl from '../components/FlameControl';
import {View} from 'react-native';

const SettingsScreen = () => {
  const {
    colors,
    storageError,
    showBackgroundImage,
    setShowBackgroundImage,
    backgroundStorageError,
  } = useTheme();
  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: colors.background}]}>
      <Header headerText="Settings" />
      <ScrollView contentContainerStyle={{padding: 28, gap: 20}}>
        <Text style={{color: colors.text, fontSize: 22, fontWeight: '600'}}>
          Appearance
        </Text>
        <ThemeControl />
        <Text style={{color: colors.text, fontSize: 18}}>Font</Text>
        <FontControl />
        <FlameControl />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 16,
            minHeight: 48,
            maxWidth: 480,
          }}>
          <Text style={{color: colors.text, fontSize: 18, flex: 1}}>
            Show background image
          </Text>
          <Switch
            accessibilityLabel="Show background image"
            value={showBackgroundImage}
            onValueChange={setShowBackgroundImage}
            trackColor={{false: colors.muted, true: colors.accent}}
          />
        </View>
        {!!backgroundStorageError && (
          <Text accessibilityRole="alert" style={{color: colors.error}}>
            {backgroundStorageError}
          </Text>
        )}
        {!!storageError && (
          <Text accessibilityRole="alert" style={{color: colors.error}}>
            {storageError}
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SettingsScreen;
