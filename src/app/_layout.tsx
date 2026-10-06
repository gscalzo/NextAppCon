import * as Notifications from 'expo-notifications';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { AgendaProvider } from '../state/AgendaContext.tsx';

/** Opens the talk when a reminder notification is tapped. */
function useOpenTalkFromNotification() {
  const response = Notifications.useLastNotificationResponse();
  useEffect(() => {
    const id = response?.notification.request.content.data?.sessionId;
    if (typeof id === 'string') router.push(`/session/${id}`);
  }, [response]);
}

export default function RootLayout() {
  useOpenTalkFromNotification();
  return (
    <AgendaProvider>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="session/[id]"
          options={{
            presentation: 'formSheet',
            sheetAllowedDetents: [0.6, 1],
            sheetGrabberVisible: true,
            headerShown: false,
          }}
        />
      </Stack>
    </AgendaProvider>
  );
}
