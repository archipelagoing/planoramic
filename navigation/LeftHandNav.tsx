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
import {Platform, useWindowDimensions} from 'react-native';
import {
  createDrawerNavigator,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import {CalendarScreen, SettingsScreen} from '../screens';
import DrawerContent from './DrawerContent';
import {useTheme} from '../theme/ThemeProvider';
import {useFont} from '../theme/FontProvider';
import GlassButton from '../components/GlassButton';
import BriefScreen from '../screens/BriefScreen';
import HouseholdScreen from '../screens/HouseholdScreen';
import PomoScreen from '../screens/PomoScreen';

const Drawer = createDrawerNavigator();

const LeftHandNav = () => {
  const {colors} = useTheme();
  const {family} = useFont();
  const {width} = useWindowDimensions();
  const compact = Platform.OS === 'web' && width < 700;
  return (
    <Drawer.Navigator
      drawerContent={(props: DrawerContentComponentProps) => {
        const {state} = props;
        const currentRoute = props.state.routeNames[state.index];
        return <DrawerContent route={currentRoute} />;
      }}
      screenOptions={({navigation}) => ({
        drawerType: compact ? 'front' : 'permanent',
        drawerStyle: {
          width: Platform.OS === 'web' ? 240 : 'auto',
          backgroundColor:
            Platform.OS === 'web' ? 'transparent' : colors.sidebar,
        },
        headerShown: compact,
        headerStyle: {backgroundColor: colors.sidebar},
        headerTintColor: colors.text,
        headerTitleStyle: {fontFamily: family, fontWeight: 'normal'},
        headerLeft: compact
          ? () => (
              <GlassButton
                label="Open navigation"
                icon="menu"
                iconOnly
                onPress={() => navigation.toggleDrawer()}
              />
            )
          : undefined,
      })}>
      <Drawer.Screen name="Calendar" component={CalendarScreen} />
      <Drawer.Screen name="Brief" component={BriefScreen} />
      <Drawer.Screen name="Household" component={HouseholdScreen} />
      <Drawer.Screen name="Pomo" component={PomoScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
    </Drawer.Navigator>
  );
};

export default LeftHandNav;
