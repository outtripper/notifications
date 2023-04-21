import {TokenService} from '@loopback/authentication';
import {TokenServiceBindings} from '@loopback/authentication-jwt';
import {inject} from '@loopback/core';
import {UserProfile} from '@loopback/security';
import {promisify} from 'util';

const jwt = require('jsonwebtoken');

export class JWTService implements TokenService {
  constructor(
    @inject(TokenServiceBindings.TOKEN_SECRET)
    private jwtSecret: string,
    @inject(TokenServiceBindings.TOKEN_EXPIRES_IN)
    private jwtExpiresIn: string,
  ) {}

  async verifyToken(token: string): Promise<UserProfile> {
    return promisify(jwt.verify)(token, this.jwtSecret);
  }

  async generateToken(userProfile: {[key: string]: string}): Promise<string> {
    return jwt.sign(userProfile, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
    });
  }
}
