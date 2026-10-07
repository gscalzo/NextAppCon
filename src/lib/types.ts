export type Session = {
  id: string;
  title: string;
  description: string;
  /** Epoch ms (UTC). */
  startsAt: number;
  /** Epoch ms (UTC). */
  endsAt: number;
  room: string;
  /** Sub-conference / track, e.g. "droidCon". */
  track: string | null;
  speakers: string[];
  /** Speaker photo URLs, parallel to the session's Sessionize speakers; absent in agendas saved before photos. */
  speakerPhotos?: (string | null)[];
  /** Breaks, lunch, registration: shown but not favable. */
  isService: boolean;
};

export type AgendaCache = {
  sessionizeId: string;
  fetchedAt: number;
  sessions: Session[];
};
