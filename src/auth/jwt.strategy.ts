import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { FirebaseService } from '../firebase/firebase.service.js';

export interface JwtPayload {
  sub: string;
  email: string;
  rol: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private firebaseService: FirebaseService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'secret',
    });
  }

  async validate(payload: JwtPayload) {
    const userDoc = await this.firebaseService
      .getFirestore()
      .collection('usuarios')
      .doc(payload.sub)
      .get();

    if (!userDoc.exists) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const userData = userDoc.data();
    return {
      id: userDoc.id,
      nombre: userData?.nombre,
      email: userData?.email,
      rol: userData?.rol,
    };
  }
}
