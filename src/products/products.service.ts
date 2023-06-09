import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { validate as isUuid } from 'uuid';
import { Product, ProductImage } from './entities';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const { images = [], ...productProperties } = createProductDto;

    const product = this.productRepository.create({
      ...productProperties,
      images: images.map((imageUrl) =>
        this.productImageRepository.create({ url: imageUrl }),
      ),
    });
    await this.productRepository.save(product);

    return { ...product, images };
  }

  async findAll(paginationDto: PaginationDto) {
    const products = await this.productRepository.find({
      take: paginationDto.limit || 5,
      skip: paginationDto.offset || 0,
      relations: { images: true },
    });

    return products.map((product) => ({
      ...product,
      images: product.images.map((image) => image.url),
    }));
  }

  async findOne(term: string) {
    let product: Product;

    if (isUuid(term)) {
      product = await this.productRepository.findOne({
        where: { id: term },
        relations: { images: true },
      });
    } else {
      product = await this.productRepository.findOne({
        where: { slug: term },
        relations: { images: true },
      });
    }

    if (!product) {
      throw new NotFoundException(`Product with id: ${term} not found`);
    }

    return { ...product, images: product.images.map((image) => image.url) };
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const { images, ...rest } = updateProductDto;

    let product = await this.productRepository.preload({
      id,
      ...rest,
    });

    const QueryRunner = this.dataSource.createQueryRunner();
    await QueryRunner.connect();
    await QueryRunner.startTransaction();

    try {
      if (product) {
        if (images) {
          await QueryRunner.manager.delete(ProductImage, { product: id });

          product.images = images.map((imageUrl) =>
            this.productImageRepository.create({ url: imageUrl }),
          );
        } else {
          product.images = await this.productImageRepository.findBy({
            product: { id },
          });
        }

        await QueryRunner.manager.save(product);
        await QueryRunner.commitTransaction();
        return this.findOne(id);
      }
    } catch (error) {
      await QueryRunner.rollbackTransaction();
      throw new ExceptionsHandler(error);
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

  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product');

    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      throw new ExceptionsHandler(error);
    }
  }
}
