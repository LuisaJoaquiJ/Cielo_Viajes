export default () => ({
  app: {
    port: Number(process.env.PORT ?? 3001),
    prefix: process.env.API_PREFIX ?? 'api',
  },
  cors: {
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  },
});
