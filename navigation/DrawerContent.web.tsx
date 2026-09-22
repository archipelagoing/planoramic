import React from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import {useTheme} from '../theme/ThemeProvider';
import {ParamListBase, useNavigation} from '@react-navigation/native';
import {DrawerItem, DrawerNavigationProp} from '@react-navigation/drawer';
import Icon from '../components/FlameIcon';
import {menuItems} from './menuItems';
import {useFont} from '../theme/FontProvider';

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
  const {colors, dark} = useTheme();
  const {family} = useFont();
  const navigation = useNavigation<DrawerNavigationProp<ParamListBase>>();

  return (
    <ScrollView
      testID="glass-sidebar"
      style={[
        styles.drawer,
        {
          backgroundColor: dark
            ? 'rgba(33,30,32,0.82)'
            : 'rgba(246,245,245,0.76)',
          ...{backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)'},
          borderRightWidth: 1,
          borderRightColor: colors.glassBorder,
        },
      ]}
      contentContainerStyle={styles.content}>
      {browserMenuItems.map(item => (
        <DrawerItem
          key={item.screen}
          label={item.name}
          labelStyle={{fontFamily: family, fontWeight: 'normal'}}
          icon={item.renderIcon}
          focused={route === item.screen}
          activeTintColor={colors.accent}
          inactiveTintColor={colors.muted}
          activeBackgroundColor={
            dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.5)'
          }
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
