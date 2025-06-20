import { Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AuthRequest } from 'src/auth/types/auth-request.interface';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('Cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')

export class CartController {
    constructor(private readonly cartService: CartService) {}

  @ApiOperation({ summary: 'Add a product to cart' })
  @ApiParam({ name: 'productId' })
  @Post(':productId')
  addToCart(@Req() req: AuthRequest, @Param('productId') productId: string) {
    return this.cartService.addToCart(req.user.userId, Number(productId));
  }

  @ApiOperation({ summary: 'Get user’s cart' })
  @Get()
  getCart(@Req() req: AuthRequest) {
    return this.cartService.getCart(req.user.userId);
  }

  @ApiOperation({ summary: 'Remove a product from cart' })
  @ApiParam({ name: 'productId' })
  @Delete(':productId')
  remove(@Req() req: AuthRequest, @Param('productId') productId: string) {
    return this.cartService.removeFromCart(req.user.userId, Number(productId));
  }
}
