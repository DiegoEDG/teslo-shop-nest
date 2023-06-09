import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { initialData } from './data/seedData';

@Injectable()
export class SeedService {
  constructor(private readonly productsService: ProductsService) {}

  async runSeed() {
    await this.productsService.deleteAllProducts();

    const seedProducts = initialData.products;
    const insertPromises = [];

    seedProducts.forEach((product) => {
      insertPromises.push(this.productsService.create(product));
    });

    await Promise.all(insertPromises);

    return `Seed executed`;
  }
}
