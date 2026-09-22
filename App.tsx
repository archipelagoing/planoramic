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
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from '@react-navigation/native';
import {ThemeProvider, useTheme, pearlImageStyle} from './theme/ThemeProvider';
import LeftHandNav from './navigation/LeftHandNav';
import {
  ActivityIndicator,
  View,
  Image,
  StyleSheet,
  Platform,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {useFonts} from 'expo-font';
import {Montserrat_500Medium} from '@expo-google-fonts/montserrat/500Medium';
import {InstrumentSerif_400Regular} from '@expo-google-fonts/instrument-serif/400Regular';
import {CormorantGaramond_500Medium} from '@expo-google-fonts/cormorant-garamond/500Medium';
import {CormorantInfant_500Medium} from '@expo-google-fonts/cormorant-infant/500Medium';
import {FontProvider} from './theme/FontProvider';
import {WorkspaceProvider} from './theme/WorkspaceProvider';
import {TasksProvider} from './theme/TasksProvider';
import {AveriaSerifLibre_300Light_Italic} from '@expo-google-fonts/averia-serif-libre/300Light_Italic';
import {AveriaSerifLibre_300Light} from '@expo-google-fonts/averia-serif-libre/300Light';
import {Montserrat_500Medium_Italic} from '@expo-google-fonts/montserrat/500Medium_Italic';
import {InstrumentSerif_400Regular_Italic} from '@expo-google-fonts/instrument-serif/400Regular_Italic';
import {CormorantGaramond_500Medium_Italic} from '@expo-google-fonts/cormorant-garamond/500Medium_Italic';
import {CormorantInfant_500Medium_Italic} from '@expo-google-fonts/cormorant-infant/500Medium_Italic';

const App = () => {
  const [loaded, error] = useFonts({
    ...MaterialCommunityIcons.font,
    Montserrat_500Medium_Italic,
    InstrumentSerif_400Regular_Italic,
    CormorantGaramond_500Medium_Italic,
    CormorantInfant_500Medium_Italic,
    AveriaSerifLibre_300Light_Italic,
    AveriaSerifLibre_300Light,
    Montserrat_500Medium,
    InstrumentSerif_400Regular,
    CormorantGaramond_500Medium,
    CormorantInfant_500Medium,
  });
  if (!loaded && !error)
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#171719',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <ActivityIndicator size="large" color="#F08080" />
      </View>
    );
  return (
    <ThemeProvider>
      <FontProvider>
        <WorkspaceProvider>
          <TasksProvider>
            <ThemedApp />
          </TasksProvider>
        </WorkspaceProvider>
      </FontProvider>
    </ThemeProvider>
  );
};

const ThemedApp = () => {
  const {colors, dark, showBackgroundImage} = useTheme();
  return (
    <View style={{flex: 1, backgroundColor: colors.background}}>
      {Platform.OS === 'web' && showBackgroundImage && (
        <>
          <Image
            testID="app-background"
            source={require('./assets/images/frosted1.png')}
            accessible={false}
            resizeMode="cover"
            style={[
              StyleSheet.absoluteFillObject,
              {width: '100%', height: '100%'},
              !dark && pearlImageStyle,
            ]}
          />
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFillObject,
              {
                backgroundColor: dark
                  ? 'rgba(14,10,12,0.48)'
                  : 'rgba(248,245,241,0.68)',
              },
            ]}
          />
        </>
      )}
      <NavigationContainer
        theme={{
          ...(dark ? DarkTheme : DefaultTheme),
          colors: {
            ...DefaultTheme.colors,
            primary: colors.accent,
            background:
              Platform.OS === 'web' ? 'transparent' : colors.background,
            card: colors.sidebar,
            text: colors.text,
            border: colors.border,
          },
        }}>
        <LeftHandNav />
      </NavigationContainer>
    </View>
  );
};

export default App;
