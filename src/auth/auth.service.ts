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
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
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

      const token = this.generateToken({ email: user.email });

      return {
        message: 'User created successfully',
        email: user.email,
        name: user.name,
        token,
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.userRepository.findOneBy({
      email: loginUserDto.email,
    });

    if (!user || !compareSync(loginUserDto.password, user.password)) {
      throw new UnauthorizedException('Credentials are not valid');
    }

    const token = this.generateToken({ email: user.email });

    return {
      email: user.email,
      token,
    };
  }

  private generateToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }
}
