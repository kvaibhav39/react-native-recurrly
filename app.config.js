// Dynamic Expo config — extends app.json with runtime environment variables.
// PostHog keys are injected via the `extra` field and accessed in the app
// via Constants.expoConfig.extra (expo-constants).
const appJson = require('./app.json')

/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  ...appJson.expo,
  extra: {
    ...appJson.expo.extra,
    posthogProjectToken: process.env.POSTHOG_PROJECT_TOKEN,
    posthogHost: process.env.POSTHOG_HOST,
  },
}
