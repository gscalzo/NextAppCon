# NextAppCon Agenda

A personal Expo / React Native app for the next.app devCon Berlin agenda (7–9 Oct 2026).

- **Offline:** the agenda is downloaded from Sessionize and cached on the phone. It refreshes when it's older than 30 minutes and you're online, and you can pull to refresh. If a refresh fails, the cached copy stays and a line shows how old it is.
- **Talk type:** each talk shows a colour chip for its sub-conference (droidCon, flutterCon, swiftCon, reactCon, agentic codingCon, xr devsCon, game devs). The agenda can be filtered by it.
- **Favourites:** tap ★. *My schedule* lists your favourites by day, with a "NOW / NEXT" banner and countdown.
- **Reminders:** a local notification fires 5 minutes before each favourite starts, showing the title, start time and room. Tapping it opens the talk. Reminders are rescheduled whenever favourites or the agenda change, so a moved talk still gets the right time.
- **Clash warning:** if a talk you fav overlaps one you already have (any overlap; back-to-back is fine), an alert offers **Keep both / Replace / Cancel**. Clashing favourites are highlighted in red.

All times are shown in Berlin time, whatever time zone the phone is in.

## Where the data comes from

On first launch the app scans `nextappcon.com` (`/agenda`, `/schedule`, `/program`, the home page, and the sub-conference pages) for an embedded `sessionize.com/api/v2/<id>/` URL. It then downloads `https://sessionize.com/api/v2/<id>/view/All`. If auto-detection fails, open **Settings → Sessionize ID** and paste the ID or any `sessionize.com/api/v2/…` URL from the agenda page's source.

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
npm test            # pure-logic tests (Berlin time, Sessionize parsing, clashes, next-up)
npm run typecheck
npm run lint
```

Code layout:

- `src/lib/`: pure logic, no React Native imports (tested with `node --test`)
- `src/state/`: storage, Sessionize fetching and discovery, notifications, the `AgendaProvider` context
- `src/app/`: Expo Router screens (Agenda, My schedule, Settings, talk detail)

There is no committed lockfile yet; `npm install` creates one. App icons are not set, so Expo Go shows its default.
