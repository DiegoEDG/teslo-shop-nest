import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { compareSync, hashSync } from 'bcrypt';
import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { password, ...rest } = createUserDto;

    try {
      const user = await this.userRepository.create({
        ...rest,
        password: hashSync(password, 10),
      });

      await this.userRepository.save(user);
      delete user.password;

      return {
        message: 'User created successfully',
        id: user.id,
        name: user.name,
        email: user.email,
      };
    } catch (error) {
      throw new BadRequestException('User already exists');
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.userRepository.findOneBy({
      email: loginUserDto.email,
    });

    if (!user || !compareSync(loginUserDto.password, user.password)) {
      throw new UnauthorizedException('Credentials are not valid');
    }

    return true;
  }
}
