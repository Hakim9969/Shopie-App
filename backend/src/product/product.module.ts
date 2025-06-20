import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
   imports: [PrismaModule, CloudinaryModule],
  providers: [ProductService],
  controllers: [ProductController]
})
export class ProductModule {}
