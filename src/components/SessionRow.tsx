import { Link } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { trackColor } from '../lib/tracks.ts';
import { formatTime } from '../lib/time.ts';
import type { Session } from '../lib/types.ts';
import { noOrphan } from '../lib/text.ts';
import { useAgenda } from '../state/AgendaContext.tsx';
import { Avatars } from './Avatars.tsx';
import { Badge } from './Badge.tsx';
import { Cover } from './Cover.tsx';
import { FadeIn, usePop, usePressScale, usePulse } from './motion.tsx';
import { Star } from './Star.tsx';
import { colors, font, gutter, ripple } from './theme.ts';

type Props = { session: Session; now: number; clash?: boolean; compact?: boolean; index?: number };

const COVER = 68;

export function SessionRow({ session, now, clash = false, compact = false, index = 0 }: Props) {
  const { favIds, toggleFav, switchTo, planEntry, attendedIds, notes } = useAgenda();
  const fav = favIds.has(session.id);
  const attended = attendedIds.has(session.id);
  const hasNote = !!notes[session.id];
  const entry = planEntry(session.id);
  const live = session.startsAt <= now && now < session.endsAt;
  const past = session.endsAt <= now;
  const keynote = entry?.role === 'pick' && entry.slot.kind === 'keynote';
  const topPick = entry?.role === 'pick' && entry.slot.topPick;
  const alternative = entry?.role === 'alternative' && !fav;
  const minutes = Math.round((session.endsAt - session.startsAt) / 60_000);
  const status = live
    ? { label: 'Live', color: colors.now }
    : attended
      ? { label: 'Attended', color: colors.success }
      : clash
        ? { label: 'Clash', color: colors.danger }
        : keynote
          ? { label: 'Keynote', color: colors.accent }
          : topPick
            ? { label: 'Top pick', color: colors.star }
            : null;

  const press = usePressScale();
  const star = usePop();
  const pulse = usePulse(live);
  const onStar = () => {
    star.pop();
    toggleFav(session);
  };

  // Link asChild drops function styles on its child, so the Pressable stays unstyled
  // and the visuals (and press animation) live on the Animated.View inside it.
  return (
    <FadeIn index={index}>
      <Link href={`/session/${session.id}`} asChild>
        <Link.Trigger>
          <Pressable
            {...press.handlers}
            android_ripple={ripple}
            accessibilityRole="button"
            accessibilityLabel={session.title}
          >
            <Animated.View style={[styles.row, compact && styles.compact, past && styles.past, press.style]}>
              <View>
                <Cover session={session} size={compact ? 40 : COVER} />
                {!compact && status && (
                  <View style={styles.coverBadge}>
                    <Badge label={status.label} color={status.color} solid />
                  </View>
                )}
              </View>

              <View style={styles.body}>
                {session.speakers.length > 0 && !compact && (
                  <View style={styles.speakerRow}>
                    <Avatars names={session.speakers} photos={session.speakerPhotos} size={16} />
                    <Text style={styles.speakers} numberOfLines={1}>
                      {session.speakers.join(', ')}
                    </Text>
                  </View>
                )}
                <Text
                  style={[styles.title, compact && styles.compactTitle, session.isService && styles.serviceTitle]}
                  numberOfLines={compact ? 2 : 3}
                  lineBreakStrategyIOS="standard"
                  textBreakStrategy="balanced"
                >
                  {noOrphan(session.title)}
                </Text>
                {compact ? (
                  <Text style={styles.meta} numberOfLines={1}>
                    {formatTime(session.startsAt)} · Alternative{session.room ? ` · ${session.room}` : ''}
                  </Text>
                ) : (
                  <>
                    <View style={styles.metaRow}>
                      {live ? (
                        <Animated.View style={[styles.liveDot, pulse]} />
                      ) : (
                        <SymbolView
                          name={{ ios: 'clock', android: 'schedule' }}
                          size={13}
                          tintColor={colors.faint}
                        />
                      )}
                      <Text style={[styles.meta, live && styles.live]}>
                        {formatTime(session.startsAt)} – {formatTime(session.endsAt)} · {minutes} min
                      </Text>
                      {hasNote && (
                        <SymbolView
                          name={{ ios: 'note.text', android: 'sticky_note_2' }}
                          size={13}
                          tintColor={colors.faint}
                          accessibilityLabel="Has notes"
                          fallback={<Text style={styles.meta}>✎</Text>}
                        />
                      )}
                    </View>
                    {(!!session.room || !!session.track) && (
                      <View style={styles.metaRow}>
                        <SymbolView
                          name={{ ios: 'mappin.and.ellipse', android: 'location_on' }}
                          size={13}
                          tintColor={colors.faint}
                        />
                        <Text style={[styles.meta, styles.shrink]} numberOfLines={1}>
                          {session.room || session.track}
                        </Text>
                        {!!session.track && !!session.room && (
                          <View style={[styles.trackDot, { backgroundColor: trackColor(session.track) }]} />
                        )}
                      </View>
                    )}
                    {alternative && <Text style={styles.altNote}>Alternative in your plan</Text>}
                  </>
                )}
              </View>

              {!session.isService && (
                <Pressable
                  onPress={onStar}
                  hitSlop={12}
                  accessibilityRole="button"
                  accessibilityLabel={fav ? 'Remove from favourites' : 'Add to favourites'}
                  style={styles.star}
                >
                  <Animated.View style={star.style}>
                    <Star filled={fav} color={fav ? colors.star : colors.faint} size={compact ? 17 : 21} />
                  </Animated.View>
                </Pressable>
              )}
            </Animated.View>
          </Pressable>
        </Link.Trigger>
        <Link.Preview />
        {!session.isService && (
          <Link.Menu>
            <Link.MenuAction icon={fav ? 'star.slash' : 'star'} onPress={() => toggleFav(session)}>
              {fav ? 'Remove from favourites' : 'Add to favourites'}
            </Link.MenuAction>
            {!fav && (
              <Link.MenuAction icon="arrow.left.arrow.right" onPress={() => switchTo(session)}>
                Switch to this talk
              </Link.MenuAction>
            )}
          </Link.Menu>
        )}
      </Link>
    </FadeIn>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, paddingHorizontal: gutter, paddingVertical: 12 },
  // Alternatives sit indented under the pick, smaller and quieter.
  compact: { paddingLeft: gutter + COVER - 40, paddingVertical: 8 },
  past: { opacity: 0.45 },
  coverBadge: { position: 'absolute', bottom: -9, left: 0, right: 0, alignItems: 'center' },
  body: { flex: 1, gap: 4 },
  speakerRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  speakers: { ...font.meta, flex: 1, color: colors.muted },
  title: { ...font.title, color: colors.text },
  compactTitle: { fontSize: 15, lineHeight: 20, fontWeight: '500', letterSpacing: -0.2 },
  serviceTitle: { fontWeight: '500', color: colors.muted },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  meta: { ...font.meta, ...font.time, color: colors.muted },
  live: { color: colors.now, fontWeight: '600' },
  liveDot: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 2.5, backgroundColor: colors.now },
  shrink: { flexShrink: 1 },
  trackDot: { width: 6, height: 6, borderRadius: 3, marginLeft: 2 },
  altNote: { ...font.caption, color: colors.faint, marginTop: 2 },
  star: { paddingTop: 2, paddingLeft: 4 },
});
