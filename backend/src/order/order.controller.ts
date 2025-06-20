import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards} from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { JwtUser } from 'src/auth/strategy/jwt.strategy';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Role } from 'src/common/enums/role.enum';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('order')
@UseGuards(JwtAuthGuard)
export class OrderController {
    constructor(private readonly orderService: OrderService) {}

  @ApiOperation({ summary: 'Checkout cart and place an order' })
  @Post('checkout')
  async checkout(@GetUser() user: JwtUser) {
    return this.orderService.checkout(user.userId);
  }

  @ApiOperation({  })
  @Get('my-orders')
  async getMyOrders(@GetUser() user: JwtUser) {
    return this.orderService.getMyOrders(user.userId);
  }

  
@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
@ApiOperation({  })
@Get('stats')
getDashboardStats() {
  return this.orderService.getDashboardStats();
}

  @ApiOperation({ summary: 'Get a specific order by ID' })
  @Get(':id')
async getOrderById(@Param('id') orderId: string, @GetUser() user: JwtUser) {
  return this.orderService.getOrderById(orderId, user.userId);
}

  @ApiBearerAuth()
  @ApiOperation({ })
  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN) // Only admins can update order status
  updateOrderStatus(
    @Param('id') orderId: string,
    @Body('status') status: 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED',
  ) {
    return this.orderService.updateStatus(orderId, status);
  }

  @ApiBearerAuth()
  @ApiOperation({ })
  @Patch(':id/cancel')
  @UseGuards(RolesGuard)
  @Roles(Role.CUSTOMER)
  async cancelOrder(@Param('id') orderId: string, 
  @GetUser() user: JwtUser) {
  return this.orderService.cancelOrder(orderId, user.userId);
}


@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
 @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all orders with filters (Admin only)' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @Get()
@Get()
getAllOrders(
  @Query('status') status?: 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED',
  @Query('search') search?: string,
  @Query('from') from?: string,
  @Query('to') to?: string,
) {
  return this.orderService.getAllOrders(status, search, from, to);
}

@ApiBearerAuth()
@ApiOperation({ summary: 'Delete order (Admin only)' })
@Delete(':id')
@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
deleteOrder(@Param('id') orderId: string) {
  return this.orderService.deleteOrder(orderId);
}

}
