import { registerAs } from '@nestjs/config';

export default registerAs('config', () => {
  return {
    MP_ACCESS_TOKEN: process.env.MP_ACCESS_TOKEN,
    PORT: process.env.PORT || 8080,
    smtp: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  };
});
