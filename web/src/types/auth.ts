export interface SessionUser {
  userId: number;
  email: string;
  isVip: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  passport: string;
  password: string;
}
