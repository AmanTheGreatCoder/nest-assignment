export default () => ({
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET_KEY,
    expiresIn: process.env.JWT_EXPIRATION_TIME,
  },
  mail: {
    mailUser: process.env.MAIL_USER,
    mailPass: process.env.MAIL_PASS,
    mailHost: process.env.MAIL_HOST,
  },
});
