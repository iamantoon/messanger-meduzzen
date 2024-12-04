import { IUser } from './user.interface';
import { compare, genSalt, hash } from 'bcryptjs';

export class UserEntity implements IUser {
  id?: string;
  firstName: string;
  lastName: string;
  username: string;
  password: string;

  constructor(user: IUser) {
    this.id = user.id;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.username = user.username;
    this.password = user.password;
  }

  public async setPassword(password: string) {
    const salt = await genSalt(10);
    this.password = await hash(password, salt);
    return this;
  }

  public validatePassword(password: string) {
    return compare(password, this.password);
  }
}
