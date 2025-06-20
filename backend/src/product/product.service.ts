import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductService {
    constructor(private prisma: PrismaService) {}

   async create(data: Prisma.ProductCreateInput) {
    // Check for existing product by name + description
    const existing = await this.prisma.product.findFirst({
      where: {
        name: data.name,
        shortDescription: data.shortDescription,
      },
    });

    if (existing) {
      throw new ConflictException('Product already exists');
    }

    return this.prisma.product.create({ data });
  }


  findAll() {
    return this.prisma.product.findMany();
  }

  findOne(id: number) {
    return this.prisma.product.findUnique({ where: { id } });
  }

  update(id: number, data: Prisma.ProductUpdateInput) {
    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  remove(id: number) {
    return this.prisma.product.delete({ where: { id } });
  }

  search(term: string) {
    return this.prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: term, mode: 'insensitive' } },
          { shortDescription: { contains: term, mode: 'insensitive' } },
        ],
      },
    });
  }


  async getLowStockProducts(threshold: number = 5) {
  return this.prisma.product.findMany({
    where: {
      quantityInStock: {
        lt: threshold,
      },
    },
    orderBy: {
      quantityInStock: 'asc',
    },
  });
}

}
