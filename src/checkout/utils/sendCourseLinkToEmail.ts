import { transporter } from '../../libs/nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

interface ISendCourseLinkToEmail {
  email: string;
  data: {
    id: string | number;
    picture: string;
    title: string;
    price: number | string;
    url: string;
  };
}

const sendCourseLinkToEmail = (params: ISendCourseLinkToEmail) => {
  const emailTemplateSource = fs.readFileSync(
    path.join('templates/order_complete.hbs'),
    'utf8',
  );

  const template = handlebars.compile(emailTemplateSource);

  const html = template({
    price: params.data.price,
    link: params.data.url,
    title: params.data.title,
    picture: params.data.picture,
  });

  const mailOptions = {
    from: 'formuladearbitrajelg@gmail.com',
    to:
      process.env.NODE_ENV === 'development'
        ? process.env.TEST_EMAIL
        : params.email,
    subject: 'Tu curso de emprendedor digital',
    html,
  };

  transporter.sendMail(mailOptions);
};

export default sendCourseLinkToEmail;
