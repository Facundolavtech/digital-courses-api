import * as nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: 'smtp-relay.sendinblue.com',
  port: '587',
  secure: false,
  auth: {
    user: 'formuladearbitrajelg@gmail.com',
    pass: 'xsmtpsib-376e8cf6e400648b63bd2896b841613ac8eb1af97bf1e4c5194bcdaded273e48-v8g6B01XHzTGpfra',
  },
  tls: {
    rejectUnauthorized: false,
  },
});
