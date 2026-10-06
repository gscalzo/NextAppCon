import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { PlanEntry } from '../lib/plan.ts';
import { LEAD_MINUTES, reminderText } from '../lib/reminders.ts';
import type { Session } from '../lib/types.ts';

export { LEAD_MINUTES };
// iOS keeps at most 64 pending local notifications per app.
const MAX_SCHEDULED = 60;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function ensureNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('talks', {
      name: 'Talk reminders',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  return (await Notifications.requestPermissionsAsync()).granted;
}

function content(session: Session, entry?: PlanEntry): Notifications.NotificationContentInput {
  return { ...reminderText(session, entry), sound: true, data: { sessionId: session.id } };
}

/** Replaces every pending reminder with one per upcoming fav, LEAD_MINUTES before it starts. */
export async function rescheduleReminders(
  favs: Session[],
  planEntry: (id: string) => PlanEntry | undefined,
  now = Date.now(),
): Promise<number> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  const upcoming = favs
    .map((s) => ({ session: s, at: s.startsAt - LEAD_MINUTES * 60_000 }))
    .filter(({ at }) => at > now)
    .sort((a, b) => a.at - b.at)
    .slice(0, MAX_SCHEDULED);
  for (const { session, at } of upcoming) {
    await Notifications.scheduleNotificationAsync({
      content: content(session, planEntry(session.id)),
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at, channelId: 'talks' },
    });
  }
  return upcoming.length;
}

export async function sendTestNotification(session: Session | undefined, entry?: PlanEntry): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: session ? content(session, entry) : { title: 'NextAppCon', body: 'Test reminder', sound: true },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 3, channelId: 'talks' },
  });
}
