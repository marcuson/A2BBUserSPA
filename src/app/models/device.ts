import { User } from './user';

export class Device {
  id: number;
  refreshToken: string;
  userId: string;
  enabled: boolean;
  name: string;
  user: User;
}
