# NextAppCon Agenda

A personal Expo / React Native app for the next.app devCon Berlin agenda (7–9 Oct 2026).

- **My plan:** on first launch your 24-slot route (from the AI talk planner export in `src/data/plan.ts`) is imported as favourites, including your Friday keynote. Each slot lists its alternatives underneath with the reason it was suggested; tap **Switch** to swap. Un-favs stick, and **Settings → Restore my original plan** brings the route back.
- **Where to go:** a local notification fires 5 minutes before each favourite: "Go to react nativeCon 2 · 10:20", with the title and speakers. Tapping it opens the talk.
- **Current time:** the Berlin time and the talk running now or next, with its room, sit in a Liquid Glass bar above the tab bar (iOS 26) and in a card at the top of My plan. A red now-line runs through My plan and All talks, and running talks show LIVE.
- **All talks:** every session, by day (segmented control), sub-conference and native search. Long-press a talk for a preview plus Favourite / Switch actions.
- **Offline:** the agenda is downloaded from Sessionize and cached on the phone. It refreshes when it's older than 30 minutes and you're online, and you can pull to refresh.
- **Abstract and speaker bio:** tap any talk to open its sheet with the full abstract and the speakers. Tap a speaker's name or card for their bio, photo, links and other talks.
- **Clash warning:** faving a talk that overlaps a favourite offers **Keep both / Replace / Cancel**; clashing favourites are marked CLASH.
- **Native UI:** native tabs and large-title headers, form sheets, SF Symbols, haptics, system colours with dark mode, and Liquid Glass on iOS 26 (`expo-glass-effect`; plain cards on older iOS).

All times are shown in Berlin time, whatever time zone the phone is in.

## Where the data comes from

The agenda comes from the conference's Sessionize event: `https://sessionize.com/api/v2/yak5yl8m/view/All`. Talk abstracts and speaker bios, taglines, photos and links come from the same feed. To point the app at another event, open **Settings → Sessionize ID** and paste its ID or any `sessionize.com/api/v2/…` URL.

## Run it on your iPhone (Expo Go)

```bash
npm install
npx expo start          # scan the QR code with the Camera app → opens in Expo Go
```

### Fully offline (no laptop needed at the venue)

Publish the app with EAS Update so Expo Go keeps the bundle on the phone:

```bash
npx eas-cli@latest login
npx eas-cli@latest update:configure     # one-time: links the project and sets the update URL
npx eas-cli@latest update --branch main --message "agenda app"
```

Open the update in Expo Go: sign in to the same Expo account in Expo Go, or use the QR code on the update's page on expo.dev. Then open the app once while online so it downloads and caches the agenda.

## Development

```bash
npm test            # pure-logic tests (Berlin time, Sessionize parsing, clashes, plan, reminders, now-line)
npm run typecheck
npm run lint
```

Code layout:

- `src/lib/`: pure logic, no React Native imports (tested with `node --test`)
- `src/state/`: storage, Sessionize fetching, notifications, the `AgendaProvider` context
- `src/app/`: Expo Router screens: native tabs (My plan, All talks, Settings), each with a native stack, and the talk sheet
- `src/data/plan.ts`: the imported talk plan

There is no committed lockfile yet; `npm install` creates one. App icons are not set, so Expo Go shows its default.
