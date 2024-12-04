import { Injectable } from '@nestjs/common';
import { UserEntity } from './user.entity';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  public async createUser(user: UserEntity) {
    return this.prisma.user.create({
      data: {
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        password: user.password,
      },
    });
  }

  public async findUser(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }
}
