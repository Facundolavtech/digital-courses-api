import { Controller, Get, Body, Param, Response, Post } from '@nestjs/common';
import { Response as Res } from 'express';
import { CheckoutService } from '../services/checkout.service';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Get('/:itemId')
  async create(
    @Response()
    res: Res,
    @Param('itemId') itemId: string | number,
  ) {
    const paymentLink = await this.checkoutService.create(itemId);

    return res.redirect(paymentLink);
  }

  @Post('notification')
  paymentNotification(@Body() body) {
    return this.checkoutService.notification(body);
  }
}
