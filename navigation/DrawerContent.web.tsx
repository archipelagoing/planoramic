import React from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import {ParamListBase, useNavigation} from '@react-navigation/native';
import {DrawerItem, DrawerNavigationProp} from '@react-navigation/drawer';
import {Icon} from 'react-native-paper';
import {menuItems} from './menuItems';

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
  const navigation = useNavigation<DrawerNavigationProp<ParamListBase>>();

  return (
    <ScrollView style={styles.drawer} contentContainerStyle={styles.content}>
      {browserMenuItems.map(item => (
        <DrawerItem
          key={item.screen}
          label={item.name}
          icon={item.renderIcon}
          focused={route === item.screen}
          activeTintColor="#FF9900"
          inactiveTintColor="white"
          activeBackgroundColor="#12181F"
          onPress={() => navigation.navigate(item.screen)}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  drawer: {
    flex: 1,
    backgroundColor: '#232F3E',
  },
  content: {
    paddingTop: 50,
  },
});

export default DrawerContent;
