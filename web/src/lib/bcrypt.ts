import bcrypt from 'bcrypt';

export const hashPassword = (value: string) => {
  return bcrypt.hash(value, 10);
};

export const comparePassword = (value: string, hash: string) => {
  return bcrypt.compare(value, hash);
};
