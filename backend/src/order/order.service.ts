import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrderService {
    constructor(private readonly prisma: PrismaService, private readonly mailService: MailService,) {}

    
  async checkout(userId: string) {
  const cartItems = await this.prisma.cartItem.findMany({
    where: { userId },
    include: { product: true },
  });

  if (cartItems.length === 0) {
    throw new BadRequestException('Cart is empty');
  }

  let total = 0;

  const orderItems = cartItems.map((item) => {
    const price = item.product.price;
    total += price * item.quantity;

    return {
      productId: item.productId,
      quantity: item.quantity,
      price,
    };
  });

  const order = await this.prisma.order.create({
    data: {
      userId,
      totalPrice: total,
      items: {
        create: orderItems,
      },
    },
  });

  // Reduce stock and check low stock
  for (const item of cartItems) {
    const product = await this.prisma.product.update({
      where: { id: item.productId },
      data: {
        quantityInStock: {
          decrement: item.quantity,
        },
      },
    });

    // Low stock alert
    if (product.quantityInStock < 5) {
      await this.mailService.sendEmail({
        to: 'admin@example.com',
        subject: `Low Stock Alert: ${product.name}`,
        template: 'low-stock-alert',
        context: {
          productName: product.name,
          quantityLeft: product.quantityInStock,
        },
      });
    }
  }

  // Send Order Confirmation Email
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  const orderedProducts = cartItems.map((item) => ({
    name: item.product.name,
    quantity: item.quantity,
  }));

  await this.mailService.sendOrderConfirmationEmail(
    user.email,
    order.id,
    total,
    orderedProducts,
  );

  // Clear cart
  await this.prisma.cartItem.deleteMany({
    where: { userId },
  });

  return order;
}


  async getMyOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: true },
    });
  }

  async getOrderById(orderId: string, userId: string) {
  const order = await this.prisma.order.findFirst({
    where: {
      id: parseInt(orderId, 10),
      userId,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!order) {
    throw new NotFoundException('Order not found');
  }

  return order;
}

async updateStatus(orderId: string, status: 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED') {
 const order = await this.prisma.order.update({
    where: { id: parseInt(orderId, 10) },
    data: { status },
    include: {
      user: {
        select: { email: true, name: true },
      },
    },
  });

  if (order.user?.email) {
    await this.mailService.sendEmail({
      to: order.user.email,
      subject: `Your Order #${order.id} Status Updated`,
      template: 'order-status-update',
      context: {
        name: order.user.name,
        orderId: order.id,
        status: order.status,
      },
    });
  }

  return order;

}


async cancelOrder(orderId: string, userId: string) {
  const order = await this.prisma.order.findFirst({
    where: {
      id: parseInt(orderId, 10),
      userId,
    },
    include: {
      items: true,
    },
  });

  if (!order) {
    throw new NotFoundException('Order not found');
  }

  if (order.status !== 'PENDING') {
    throw new BadRequestException('Only pending orders can be cancelled');
  }

  // Restock products
  for (const item of order.items) {
    await this.prisma.product.update({
      where: { id: item.productId },
      data: {
        quantityInStock: {
          increment: item.quantity,
        },
      },
    });
  }

  // Update status to CANCELLED
  return this.prisma.order.update({
    where: { id: parseInt(orderId, 10) },
    data: { status: 'CANCELLED' },
  });
}

async getAllOrders(
  status?: 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED',
  search?: string, 
  from?: string,
  to?: string
) {
  return this.prisma.order.findMany({
    where: {
      ...(status && { status }),
      ...(search && {
        user: {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        },
      }),

      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

// src/order/order.service.ts
async deleteOrder(orderId: string) {
  const order = await this.prisma.order.findUnique({
    where: { id: parseInt(orderId, 10) },
    include: { items: true },
  });

  if (!order) {
    throw new NotFoundException('Order not found');
  }

  // Optional: Restock items if order is still pending
  if (order.status === 'PENDING') {
    for (const item of order.items) {
      await this.prisma.product.update({
        where: { id: item.productId },
        data: {
          quantityInStock: {
            increment: item.quantity,
          },
        },
      });
    }
  }

  // Delete order and related items
  await this.prisma.orderItem.deleteMany({
    where: { orderId: order.id },
  });

  return this.prisma.order.delete({
    where: { id: order.id },
  });
}

async getDashboardStats() {
  const [totalOrders, deliveredOrders, statusGroup] = await Promise.all([
    this.prisma.order.count(),

    this.prisma.order.aggregate({
      _sum: {
        totalPrice: true,
      },
      where: {
        status: 'DELIVERED',
      },
    }),

    this.prisma.order.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    }),
  ]);

  const statusCounts: Record<string, number> = {};
  statusGroup.forEach((group) => {
    statusCounts[group.status] = group._count.status;
  });

  return {
    totalOrders,
    totalRevenue: deliveredOrders._sum.totalPrice || 0,
    statusCounts,
  };
}

}
