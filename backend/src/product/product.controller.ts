import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';


@ApiTags('Products')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}


  // 🔐 Upload product image (Admin only)
  @Post('upload-image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload product image (Admin only)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadProductImage(@UploadedFile() file: Express.Multer.File) {
    const uploaded = await this.cloudinaryService.uploadImage(file);
    return {
      message: 'Image uploaded successfully',
      url: uploaded.secure_url,
    };
  }
  
  // 🔐 Create product
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ })
  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productService.create(dto);
  }

  // 📦 Get all products
  @ApiOperation({ summary: 'Get all products' })
  @Get()
  findAll() {
    return this.productService.findAll();
  }

  // 🔍 Search products
  @ApiOperation({ summary: 'Search products by query' })
  @ApiQuery({ name: 'q', required: true })
  @Get('search')
  search(@Query('q') query: string) {
    return this.productService.search(query);
  }

  // ✏️ Update product
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a product (Admin only)' })
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productService.update(Number(id), dto);
  }

  // ❌ Delete product
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a product (Admin only)' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(Number(id));
  }

  // product.controller.ts
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get low-stock products (Admin only)' })
  @ApiQuery({ name: 'threshold', required: false })
  @Get('low-stock')
  getLowStock(@Query('threshold') threshold?: string) {
  return this.productService.getLowStockProducts(Number(threshold) || 5);
}

 // 🔎 Get single product
  @ApiOperation({ summary: 'Get a single product by ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(Number(id));
  }


}
