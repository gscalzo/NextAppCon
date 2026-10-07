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
  /** Speaker names, in Sessionize order. */
  speakers: string[];
  /** Sessionize speaker ids, parallel to `speakers` where the speaker is known. */
  speakerIds: string[];
  /** Speaker photo URLs, parallel to `speakers`; absent in agendas saved before photos. */
  speakerPhotos?: (string | null)[];
  /** Breaks, lunch, registration: shown but not favable. */
  isService: boolean;
};

export type Speaker = {
  id: string;
  name: string;
  /** One-line role, e.g. "Staff Engineer @ Acme". */
  tagLine: string;
  bio: string;
  photoUrl: string | null;
  links: { title: string; url: string }[];
};

export type AgendaCache = {
  sessionizeId: string;
  fetchedAt: number;
  sessions: Session[];
  /** Missing in caches saved before speaker bios were added. */
  speakers?: Speaker[];
};
