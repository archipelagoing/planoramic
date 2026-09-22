import React from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import {useTheme} from '../theme/ThemeProvider';
import {ParamListBase, useNavigation} from '@react-navigation/native';
import {DrawerItem, DrawerNavigationProp} from '@react-navigation/drawer';
import {Icon} from 'react-native-paper';
import {menuItems} from './menuItems';
import {fonts} from '../components/AppText';

interface DrawerContentProps {
  route: string;
}

const browserMenuItems = menuItems.map(item => ({
  ...item,
  renderIcon: ({color, size}: {color: string; size: number}) => (
    <Icon source={item.icon} color={color} size={size} />
  ),
}));

const DrawerContent = ({route}: DrawerContentProps) => {
  const {colors} = useTheme();
  const navigation = useNavigation<DrawerNavigationProp<ParamListBase>>();

  return (
    <ScrollView
      style={[styles.drawer, {backgroundColor: colors.sidebar}]}
      contentContainerStyle={styles.content}>
      {browserMenuItems.map(item => (
        <DrawerItem
          key={item.screen}
          label={item.name}
          labelStyle={{fontFamily: fonts.medium, fontWeight: 'normal'}}
          icon={item.renderIcon}
          focused={route === item.screen}
          activeTintColor={colors.accent}
          inactiveTintColor={colors.muted}
          activeBackgroundColor={colors.surface}
          onPress={() => navigation.navigate(item.screen)}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  drawer: {
    flex: 1,
  },
  content: {
    paddingTop: 50,
  },
});

export default DrawerContent;
