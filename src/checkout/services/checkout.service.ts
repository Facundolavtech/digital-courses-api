import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import axios from 'axios';
import items from '../helpers/courses';
import sendCourseLinkToEmail from '../utils/sendCourseLinkToEmail';
import { ConfigType } from '@nestjs/config';
import config from '../../config/config';

@Injectable()
export class CheckoutService {
  constructor(
    @Inject(config.KEY) private configService: ConfigType<typeof config>,
  ) {}

  access_token = this.configService.MP_ACCESS_TOKEN;

  async create(itemId: string | number) {
    const item = items.find((item) => item.id === itemId);

    if (!item) throw new NotFoundException('El producto no existe');

    const preference = {
      payment_methods: {
        installments: 1,
      },
      items: [
        {
          id: item.id,
          title: item.title,
          quantity: 1,
          currency_id: 'ARS',
          unit_price: item.price,
          picture_url: item.picture,
          description: item.description,
        },
      ],
      back_urls: {
        success: 'https://www.success.com',
        failure: 'http://www.failure.com',
        pending: 'http://www.pending.com',
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
      const response = await axios.get(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: {
            Authorization: 'Bearer ' + this.access_token,
          },
        },
      );

      const itemId = response.data.additional_info.items[0].id;
      const payerEmail = response.data.payer.email;

      const courseData = items.find((item) => item.id === itemId);

      sendCourseLinkToEmail({ email: payerEmail, data: courseData });

      return new HttpException('Success', HttpStatus.OK);
    } catch {
      throw new InternalServerErrorException();
    }
  }
}
