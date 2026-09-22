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
  renderIcon: ({
    color,
    size,
    focused,
  }: {
    color: string;
    size: number;
    focused: boolean;
  }) => <Icon source={item.icon} color={color} size={size} active={focused} />,
}));

const DrawerContent = ({route}: DrawerContentProps) => {
  const {colors, dark} = useTheme();
  const {family, fontScale} = useFont();
  const navigation = useNavigation<DrawerNavigationProp<ParamListBase>>();

  return (
    <ScrollView
      testID="glass-sidebar"
      style={[
        styles.drawer,
        {
          backgroundColor: dark
            ? 'rgba(24,23,22,0.82)'
            : 'rgba(248,247,245,0.62)',
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
          labelStyle={{
            fontFamily: family,
            fontWeight: 'normal',
            fontSize: 14 * fontScale,
          }}
          icon={item.renderIcon}
          focused={route === item.screen}
          activeTintColor={colors.text}
          inactiveTintColor={colors.muted}
          activeBackgroundColor={
            dark ? 'rgba(255,255,255,0.045)' : 'rgba(255,255,255,0.5)'
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
