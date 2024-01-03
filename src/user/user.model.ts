export type User = {
  id: number;
  email: string;
  password: string;
  otp?: string;
  refreshToken?: string;
};
