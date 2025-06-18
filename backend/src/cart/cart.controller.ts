import { Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AuthRequest } from 'src/auth/types/auth-request.interface';

@UseGuards(JwtAuthGuard)
@Controller('cart')

export class CartController {
    constructor(private readonly cartService: CartService) {}

  @Post(':productId')
  addToCart(@Req() req: AuthRequest, @Param('productId') productId: string) {
    return this.cartService.addToCart(req.user.userId, Number(productId));
  }

  @Get()
  getCart(@Req() req: AuthRequest) {
    return this.cartService.getCart(req.user.userId);
  }

  @Delete(':productId')
  remove(@Req() req: AuthRequest, @Param('productId') productId: string) {
    return this.cartService.removeFromCart(req.user.userId, Number(productId));
  }
}
