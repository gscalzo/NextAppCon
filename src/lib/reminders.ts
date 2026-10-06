import type { PlanEntry } from './plan.ts';
import { formatTime } from './time.ts';
import type { Session } from './types.ts';

export const LEAD_MINUTES = 5;

/** Notification text sent LEAD_MINUTES before a favourite: what's next and where to go. */
export function reminderText(session: Session, entry?: PlanEntry): { title: string; body: string } {
  const at = formatTime(session.startsAt);
  const where = session.room ? `Go to ${session.room}` : 'Starting soon';
  if (entry?.slot.kind === 'keynote' && entry.role === 'pick') {
    return {
      title: `Your keynote starts at ${at}`,
      body: `${where} · “${session.title}”`,
    };
  }
  return {
    title: `${where} · ${at}`,
    body: `${session.title}${session.speakers.length ? ` — ${session.speakers.join(', ')}` : ''}`,
  };
}
