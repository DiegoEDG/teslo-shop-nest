import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { validate as isUuid } from 'uuid';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const product = this.productRepository.create(createProductDto);

    return await this.productRepository.save(product);
  }

  async findAll(paginationDto: PaginationDto) {
    return await this.productRepository.find({
      take: paginationDto.limit,
      skip: paginationDto.offset,
    });
  }

  async findOne(term: string) {
    let product: Product;

    if (isUuid(term)) {
      product = await this.productRepository.findOne({
        where: { id: term },
      });
    } else {
      product = await this.productRepository.findOne({
        where: { slug: term },
      });
    }

    if (!product) {
      throw new NotFoundException(`Product with id: ${term} not found`);
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.preload({
      id,
      ...updateProductDto,
    });

    if (product) {
      const result = await this.productRepository.update(id, product);
      if (result.affected === 1) return this.findOne(id);
    } else {
      throw new NotFoundException(`Product with id: ${id} not found`);
    }
  }

  async remove(id: string) {
    const result = await this.productRepository.delete(id);
    if (result.affected === 1) {
      return 'Product was successfully removed';
    } else {
      throw new NotFoundException(`Product with id: ${id} not found`);
    }
  }
}
