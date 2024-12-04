export interface User {
  user: UserData;
  token: string;
}

export interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
}