import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserEntity } from 'src/user/user.entity';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dtos/register.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService, private readonly jwtService: JwtService) {}

  public async register({ firstName, lastName, username, password }: RegisterDto) {
    const doesUserExist = await this.userService.findUser(username);
    if (doesUserExist) {
      throw new ConflictException('A user with this username already exists');
    }
  
    const newUserEntity = await new UserEntity({
      firstName,
      lastName,
      username: username.toLowerCase(),
      password: '',
    }).setPassword(password);
  
    const newUser = await this.userService.createUser(newUserEntity);
  
    return {
      user: {
        id: newUser.id,
        username: newUser.username,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
      },
    };
  }

  public async login(username: string, password: string) {
    const user = await this.validateUserAndReturn(username, password);
  
    const payload = { id: user.id, username: user.username };
    const token = await this.jwtService.signAsync(payload);
  
    return {
      user: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      token
    };
  }

  private async validateUserAndReturn(username: string, password: string) {
    const user = await this.userService.findUser(username.toLowerCase());
    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    const userEntity = new UserEntity(user);
    const isCorrectPassword = await userEntity.validatePassword(password);

    if (!isCorrectPassword) {
      throw new UnauthorizedException('Password is incorrect');
    }

    return {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }
}
