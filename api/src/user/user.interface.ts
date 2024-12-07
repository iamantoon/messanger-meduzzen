import { Request } from 'express';

export interface IUser {
  id?: string;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
}

export interface UserPayload {
  id: string;
  username: string;
}

export type RequestWithUserPayload = Request & { user: UserPayload }