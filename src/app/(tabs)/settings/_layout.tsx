import { Stack } from 'expo-router';

import { nativeHeader } from '../../../components/nativeHeader.ts';

export default function Layout() {
  return (
    <Stack screenOptions={nativeHeader}>
      <Stack.Screen name="index" options={{ title: 'Settings' }} />
    </Stack>
  );
}
