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

import React, {useState, useRef} from 'react';
import {
  StyleSheet,
  TVFocusGuideView,
  useTVEventHandler,
  Animated,
} from 'react-native';
import DrawerItem from './DrawerItem';
import {menuItems} from './menuItems';
import {useTheme} from '../theme/ThemeProvider';

const COLLAPSED_WIDTH = 60;
const EXPANDED_WIDTH = 200;
const ANIMATION_DURATION = 300;

interface DrawerContentProps {
  route: string;
  collapsed?: boolean;
  onToggle?: () => void;
}

const DrawerContent = ({route}: DrawerContentProps) => {
  const {colors} = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const widthAnim = useRef(new Animated.Value(COLLAPSED_WIDTH)).current;
  const textOpacityAnim = useRef(new Animated.Value(0)).current;
  const [activeFocus, setActiveFocus] = useState(false);

  const expand = () => {
    setIsExpanded(true);
    setActiveFocus(true);
    Animated.parallel([
      Animated.timing(widthAnim, {
        toValue: EXPANDED_WIDTH,
        duration: ANIMATION_DURATION,
        useNativeDriver: false,
      }),
      Animated.timing(textOpacityAnim, {
        toValue: 1,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setActiveFocus(false);
    });
  };

  const collapse = () => {
    Animated.parallel([
      Animated.timing(widthAnim, {
        toValue: COLLAPSED_WIDTH,
        duration: ANIMATION_DURATION,
        useNativeDriver: false,
      }),
      Animated.timing(textOpacityAnim, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsExpanded(false);
    });
  };

  useTVEventHandler(({eventType, eventKeyAction}) => {
    if (eventKeyAction === 1 && eventType === 'right' && isExpanded) {
      collapse();
    }
  });

  return (
    <Animated.View
      style={[
        styles.drawer,
        {width: widthAnim, backgroundColor: colors.sidebar},
      ]}>
      <TVFocusGuideView trapFocusDown>
        {menuItems.map((item, index) => (
          <DrawerItem
            key={index}
            item={item}
            route={route}
            expand={expand}
            isExpanded={isExpanded}
            textOpacityAnim={textOpacityAnim}
            hasTVPreferredFocus={activeFocus && item.screen === route}
          />
        ))}
      </TVFocusGuideView>
    </Animated.View>
  );
};

export default DrawerContent;

const styles = StyleSheet.create({
  drawer: {
    flex: 1,
    paddingTop: 50,
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 1,
  },
});
