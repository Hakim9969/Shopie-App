import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // 🔐 Create product
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productService.create(dto);
  }

  // 📦 Get all products
  @Get()
  findAll() {
    return this.productService.findAll();
  }

  // 🔍 Search products
  @Get('search')
  search(@Query('q') query: string) {
    return this.productService.search(query);
  }

  // 🔎 Get single product
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(Number(id));
  }

  // ✏️ Update product
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productService.update(Number(id), dto);
  }

  // ❌ Delete product
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(Number(id));
  }
}
