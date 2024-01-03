export default () => ({
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
  mail: {
    mailUser: process.env.MAIL_USER,
    mailPass: process.env.MAIL_PASS,
    mailHost: process.env.MAIL_HOST,
  },
});
