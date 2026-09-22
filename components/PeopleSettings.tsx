import React, {useState} from 'react';
import {View, TextInput, Pressable} from 'react-native';
import Text from './AppText';
import GlassButton from './GlassButton';
import {useTasks, personColors} from '../theme/TasksProvider';
import {useTheme, glassStyle} from '../theme/ThemeProvider';
import {useFont} from '../theme/FontProvider';

export default function PeopleSettings() {
  const {people, addPerson, ready} = useTasks();
  const {colors, dark} = useTheme();
  const {family, fontScale} = useFont();
  const [name, setName] = useState('');
  const [color, setColor] = useState(personColors[0]);
  return (
    <View style={{gap: 14}}>
      <Text
        accessibilityRole="header"
        style={{color: colors.text, fontSize: 22}}>
        People
      </Text>
      <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 12}}>
        {people.map(person => (
          <View
            key={person.id}
            style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: person.color,
              }}
            />
            <Text style={{color: colors.text, fontSize: 18}}>
              {person.name}
            </Text>
          </View>
        ))}
      </View>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 10,
          alignItems: 'center',
        }}>
        <TextInput
          accessibilityLabel="Person name"
          placeholder="Person name"
          placeholderTextColor={colors.muted}
          value={name}
          onChangeText={setName}
          maxLength={60}
          style={[
            glassStyle(colors, dark),
            {
              fontFamily: family,
              fontSize: 18 * fontScale,
              color: colors.text,
              padding: 12,
              minWidth: 180,
              flex: 1,
              borderRadius: 8,
            },
          ]}
        />
        <View
          accessibilityRole="radiogroup"
          accessibilityLabel="Person color"
          style={{flexDirection: 'row', gap: 8}}>
          {personColors.map((value, i) => (
            <Pressable
              key={value}
              accessibilityRole="radio"
              accessibilityLabel={
                ['Blue', 'Green', 'Rose', 'Gold', 'Violet'][i]
              }
              accessibilityState={{checked: color === value}}
              onPress={() => setColor(value)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: value,
                borderWidth: 3,
                borderColor: color === value ? colors.text : 'transparent',
              }}
            />
          ))}
        </View>
        <GlassButton
          label="Add person"
          icon="account-plus"
          disabled={
            !ready ||
            !name.trim() ||
            people.some(p => p.name.toLowerCase() === name.trim().toLowerCase())
          }
          onPress={() => {
            addPerson(name, color);
            setName('');
          }}
        />
      </View>
    </View>
  );
}

export function CalendarPerson({calendarId}: {calendarId: string}) {
  const {people, owners, assignCalendar} = useTasks();
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel="Calendar person"
      style={{flexDirection: 'row', flexWrap: 'wrap', gap: 8}}>
      <GlassButton
        label="Unassigned"
        radio
        selected={!owners[calendarId]}
        onPress={() => assignCalendar(calendarId, '')}
      />
      {people.map(person => (
        <GlassButton
          key={person.id}
          label={person.name}
          radio
          selected={owners[calendarId] === person.id}
          onPress={() => assignCalendar(calendarId, person.id)}
        />
      ))}
    </View>
  );
}
