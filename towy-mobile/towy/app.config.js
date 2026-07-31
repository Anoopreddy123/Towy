// Merges app.json with runtime config. Point the app at a local backend with:
//   EXPO_PUBLIC_API_BASE_URL=http://<your-lan-ip>:4000 npx expo start
module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...(config.extra || {}),
    API_BASE_URL:
      process.env.EXPO_PUBLIC_API_BASE_URL || 'https://towy-backend.vercel.app',
  },
});
