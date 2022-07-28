import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import axios from 'axios';
import sendCourseLinkToEmail from '../utils/sendCourseLinkToEmail';
import { ConfigType } from '@nestjs/config';
import config from '../../config/config';
import { coursesURL } from '../constants';

@Injectable()
export class CheckoutService {
  constructor(
    @Inject(config.KEY) private configService: ConfigType<typeof config>,
  ) {}

  access_token = this.configService.MP_ACCESS_TOKEN;

  async create(itemId: number) {
    const courses = await this.getCourses();

    const course = courses.find((item) => item.id === itemId);

    if (!course) throw new NotFoundException('El curso no existe');

    const preference = {
      payment_methods: {
        installments: 1,
      },
      items: [
        {
          id: course.id,
          title: course.title,
          quantity: 1,
          currency_id: 'ARS',
          unit_price: course.price,
          picture_url: course.picture,
          description: course.description,
        },
      ],
      back_urls: {
        success: 'https://www.success.com',
      },
      purpose: 'wallet_purchase',
      statement_descriptor: 'EMPRENDEDOR_DIGITAL',
    };

    try {
      const response = await axios.post(
        'https://api.mercadopago.com/checkout/preferences',
        preference,
        {
          headers: {
            Authorization: 'Bearer ' + this.access_token,
          },
        },
      );

      return response.data.init_point;
    } catch {
      throw new InternalServerErrorException(
        'Ocurrio un error al intentar generar el enlace de pago',
      );
    }
  }

  async notification(body) {
    try {
      const paymentId = body.data.id;

      const paymentInfo = await this.getPaymentInfo(paymentId);

      const itemId = Number(paymentInfo.additional_info.items[0].id);
      const payerEmail = paymentInfo.payer.email;

      const courses = await this.getCourses();

      const course = courses.find((item) => item.id === itemId);

      sendCourseLinkToEmail({ email: payerEmail, data: course });

      return new HttpException('Success', HttpStatus.OK);
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async getCourses() {
    try {
      const {
        data: { courses },
      } = await axios.get(coursesURL);

      return courses;
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async getPaymentInfo(id: string) {
    try {
      const response = await axios.get(
        `https://api.mercadopago.com/v1/payments/${id}`,
        {
          headers: {
            Authorization: 'Bearer ' + this.access_token,
          },
        },
      );

      return response.data;
    } catch {
      throw new InternalServerErrorException();
    }
  }
}
