import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CartService {
    constructor(private prisma: PrismaService) {}

  async addToCart(userId: string, productId: number) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');
    if (product.quantityInStock < 1) throw new BadRequestException('Out of stock');

    // Decrement stock
    await this.prisma.product.update({
      where: { id: productId },
      data: { quantityInStock: { decrement: 1 } },
    });

    // Add to cart or increment if already added
    const existing = await this.prisma.cartItem.findFirst({
      where: { userId, productId },
    });

    if (existing) {
      return this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: { increment: 1 } },
      });
    }

    return this.prisma.cartItem.create({
      data: { userId, productId, quantity: 1 },
    });
  }

  async getCart(userId: string) {
    return this.prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });
  }

  async removeFromCart(userId: string, productId: number) { // changed from number to string
    const existing = await this.prisma.cartItem.findFirst({
      where: { userId, productId },
    });
    if (!existing) throw new NotFoundException('Cart item not found');

    // Optionally restore product stock
    await this.prisma.product.update({
      where: { id: productId },
      data: { quantityInStock: { increment: existing.quantity } },
    });

    return this.prisma.cartItem.delete({ where: { id: existing.id } });
  }
}
