import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { useAgenda } from '../state/AgendaContext.tsx';
import { colors } from './theme.ts';

const COMMIT_AFTER_MS = 500;

/** Attended toggle and personal notes for one talk. Mount with `key={sessionId}`. */
export function MyTalkNotes({ sessionId }: { sessionId: string }) {
  const { notes, setNote, attendedIds, toggleAttended } = useAgenda();
  const [draft, setDraft] = useState(notes[sessionId] ?? '');
  const latest = useRef({ draft, setNote });
  useEffect(() => {
    latest.current = { draft, setNote };
  });

  // Commit once typing pauses, so lists don't re-render on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => setNote(sessionId, draft), COMMIT_AFTER_MS);
    return () => clearTimeout(timer);
  }, [sessionId, draft, setNote]);

  // Don't lose the last keystrokes when the sheet closes mid-pause.
  useEffect(() => () => latest.current.setNote(sessionId, latest.current.draft), [sessionId]);

  return (
    <View style={styles.box}>
      <View style={styles.attendedRow}>
        <Text style={styles.attendedLabel}>I attended this talk</Text>
        <Switch
          value={attendedIds.has(sessionId)}
          onValueChange={() => toggleAttended(sessionId)}
          trackColor={{ true: colors.accent }}
          accessibilityLabel="Attended"
        />
      </View>
      <View style={styles.separator} />
      <TextInput
        value={draft}
        onChangeText={setDraft}
        placeholder="Your notes"
        placeholderTextColor={colors.muted}
        multiline
        style={styles.input}
        accessibilityLabel="Your notes"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { backgroundColor: colors.card, borderRadius: 14, borderCurve: 'continuous', paddingHorizontal: 14 },
  attendedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  attendedLabel: { fontSize: 16, color: colors.text },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
  input: { minHeight: 88, paddingVertical: 12, fontSize: 15, lineHeight: 21, color: colors.text, textAlignVertical: 'top' },
});
