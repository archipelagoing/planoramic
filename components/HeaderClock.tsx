import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {Clock} from './CalendarOverview';

export default function HeaderClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <View
      testID="header-clock"
      style={{
        minWidth: 108,
        alignItems: 'center',
        flexShrink: 0,
        height: 96,
        justifyContent: 'center',
      }}>
      <View style={{transform: [{scale: 0.75}]}}>
        <Clock now={now} compact centerFace />
      </View>
    </View>
  );
}
