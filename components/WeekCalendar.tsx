import React from 'react';
import {ScrollView} from 'react-native';
import CalendarOverview from './CalendarOverview';
import {CalendarEvent, Device} from '../services/calendar';

export interface WeekCalendarProps {
  events: CalendarEvent[];
  device: Device | null;
  preview: boolean;
  hidden: string[];
  refreshToken: number;
}

export default function WeekCalendar(props: WeekCalendarProps) {
  return (
    <ScrollView>
      <CalendarOverview {...props} />
    </ScrollView>
  );
}
