import { ProductImage } from './product-image.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'text',
    unique: true,
  })
  slug: string;

  @Column({
    type: 'float',
    default: 0,
  })
  price: number;

  @Column({
    type: 'int',
    default: 0,
  })
  stock: number;

  @Column('text')
  gender: string;

  @Column('text')
  type: string;

  @Column('text', { array: true })
  tags: string[];

  @Column('text', { array: true })
  sizes: string[];

  @OneToMany(() => ProductImage, (productImage) => productImage.product, {
    cascade: true,
  })
  images: ProductImage[];

  @BeforeInsert()
  @BeforeUpdate()
  createSlug() {
    if (!this.slug) {
      this.slug = this.title;
    }
    this.slug = this.slug.trim().toLowerCase().replaceAll(' ', '-');
  }
}
