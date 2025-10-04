import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config';
import { userService } from './userService';
import { User } from '../types/domain';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

export interface LoginResult {
  token: string;
  user: AuthenticatedUser;
}

const toAuthenticatedUser = (user: User): AuthenticatedUser => ({
  id: user.id,
  email: user.email,
  full_name: user.full_name,
  role: user.role
});

export const authService = {
  async login(email: string, password: string): Promise<LoginResult> {
    const user = userService.getByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValid = await userService.verifyPassword(user, password);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    const token = this.issueToken(user);
    return { token, user: toAuthenticatedUser(user) };
  },

  issueToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role
    };
    const options: SignOptions = {
      expiresIn: config.tokenExpiresIn as SignOptions['expiresIn']
    };
    return jwt.sign(payload, config.jwtSecret, options);
  },

  verifyToken(token: string): AuthenticatedUser {
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
    const user = userService.getById(decoded.sub);
    if (!user) {
      throw new Error('User not found');
    }
    return toAuthenticatedUser(user);
  }
};
