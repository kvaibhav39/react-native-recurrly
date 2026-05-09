<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Recurrly React Native (Expo) app.

## Summary of changes

- **`package.json`** — Added `posthog-react-native` (v4.45.0) and `react-native-svg` (required peer dependency).
- **`.env`** — Added `POSTHOG_PROJECT_TOKEN` and `POSTHOG_HOST` (covered by `.gitignore`).
- **`app.config.js`** — Created dynamic Expo config that injects PostHog credentials into `Constants.expoConfig.extra` via environment variables.
- **`src/config/posthog.ts`** — Created PostHog client singleton using `expo-constants` to read config, with lifecycle capture, debug mode, and graceful no-op when unconfigured.
- **`app/_layout.tsx`** — Wrapped the app with `PostHogProvider` (autocapture for touches, manual screen tracking disabled). Added manual screen tracking via `usePathname` + `useEffect` that calls `posthog.screen()` on every route change.
- **`app/(auth)/sign-in.tsx`** — Added `sign_in_completed` (with `posthog.identify`), `sign_in_failed`, and `sign_in_mode_switched` events.
- **`app/(auth)/sign-up.tsx`** — Added `sign_up_started`, `sign_up_completed` (with `posthog.identify` and `$set_once: sign_up_date`), and `sign_up_failed` events.
- **`app/(tabs)/settings.tsx`** — Added `sign_out` event and `posthog.reset()` to clear the user's identity on sign-out.
- **`app/(tabs)/index.tsx`** — Added `subscription_card_expanded` event with subscription name, id, category, and billing cycle as properties.

## Events instrumented

| Event | Description | File |
|---|---|---|
| `sign_up_started` | User submits the sign-up form and verification code is sent to their email | `app/(auth)/sign-up.tsx` |
| `sign_up_completed` | User successfully creates an account and email is verified | `app/(auth)/sign-up.tsx` |
| `sign_up_failed` | Sign-up or email verification fails with an error | `app/(auth)/sign-up.tsx` |
| `sign_in_completed` | User successfully signs in (password or email code) | `app/(auth)/sign-in.tsx` |
| `sign_in_failed` | Sign-in attempt fails with an error | `app/(auth)/sign-in.tsx` |
| `sign_in_mode_switched` | User switches between password and email code sign-in modes | `app/(auth)/sign-in.tsx` |
| `sign_out` | User signs out from the settings screen | `app/(tabs)/settings.tsx` |
| `subscription_card_expanded` | User expands a subscription card on the home screen to view details | `app/(tabs)/index.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics dashboard](/dashboard/1563977)
- [Sign-up Conversion Funnel](/insights/XBKqZZDZ) — Conversion from sign_up_started → sign_up_completed
- [Sign-ins Over Time](/insights/Qw5Jdz1Q) — Daily active users completing sign-in
- [New Sign-ups Over Time](/insights/5vJu95Qg) — Total new account registrations per day
- [Auth Errors](/insights/VkckLZTU) — Sign-in and sign-up failures (spikes indicate auth friction)
- [Subscription Card Engagement](/insights/8X2XZ5FS) — How often users expand subscription details

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-expo/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
