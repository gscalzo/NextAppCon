import { Tabs } from 'expo-router';
import { Text, type ColorValue } from 'react-native';

import { colors } from '../../components/theme.ts';
import { useAgenda } from '../../state/AgendaContext.tsx';

const icon = (glyph: string) =>
  function TabIcon({ color }: { color: ColorValue }) {
    return <Text style={{ fontSize: 20, color }}>{glyph}</Text>;
  };

export default function TabsLayout() {
  const { favs } = useAgenda();
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: colors.accent }}>
      <Tabs.Screen name="index" options={{ title: 'Agenda', tabBarIcon: icon('☰') }} />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'My schedule',
          tabBarIcon: icon('★'),
          tabBarBadge: favs.length > 0 ? favs.length : undefined,
        }}
      />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: icon('⚙︎') }} />
    </Tabs>
  );
}
