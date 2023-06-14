import { IsString, Matches, MaxLength, MinLength } from 'class-validator';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  name: string;

  @Column('text', { unique: true })
  email: string;

  @Column('text')
  password: string;

  @Column('bool', { default: true })
  isActive: boolean;

  @Column('text', {
    array: true,
    default: ['user'],
  })
  roles: string[];

  @BeforeInsert()
  @BeforeUpdate()
  normailizeEmail() {
    this.email = this.email.toLowerCase().trim();
  }
}
