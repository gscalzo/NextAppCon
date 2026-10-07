import { useCallback, useEffect, useRef } from 'react';
import { Platform, type SectionList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type ListLocation = { sectionIndex: number; itemIndex: number };

// iOS scrolls under the transparent header, so leave room for the collapsed bar
// (plus a search bar when the screen has one) and a little breathing space.
const COMPACT_BAR = 44;
const SEARCH_BAR = 56;
const BREATHING = 8;

/**
 * Scrolls a SectionList to `location` once, the first time the list has content,
 * so the app opens on what's happening now. Later scrolling is left to the user.
 * Pass the returned handler as `onScrollToIndexFailed`.
 */
export function useLaunchScroll<ItemT, SectionT>(
  location: ListLocation | null,
  hasContent: boolean,
  { searchBar = false }: { searchBar?: boolean } = {},
) {
  const listRef = useRef<SectionList<ItemT, SectionT>>(null);
  const done = useRef(false);
  const retries = useRef(0);
  const target = useRef(location);
  useEffect(() => {
    target.current = location;
  });
  const { top } = useSafeAreaInsets();
  const viewOffset = Platform.OS === 'ios' ? top + COMPACT_BAR + (searchBar ? SEARCH_BAR : 0) + BREATHING : BREATHING;

  const scroll = useCallback(() => {
    const loc = target.current;
    if (loc) listRef.current?.scrollToLocation({ ...loc, viewOffset, animated: false });
  }, [viewOffset]);

  useEffect(() => {
    if (done.current || !hasContent) return;
    // Wait a frame so the first rows are laid out.
    const id = requestAnimationFrame(() => {
      done.current = true;
      scroll();
    });
    return () => cancelAnimationFrame(id);
  }, [hasContent, scroll]);

  // Rows far down a long list aren't measured yet: jump near them, then retry.
  const onScrollToIndexFailed = useCallback(
    (info: { index: number; averageItemLength: number }) => {
      if (retries.current >= 5) return;
      retries.current += 1;
      listRef.current?.getScrollResponder()?.scrollTo({ y: info.averageItemLength * info.index, animated: false });
      setTimeout(scroll, 50);
    },
    [scroll],
  );

  return { listRef, onScrollToIndexFailed };
}
