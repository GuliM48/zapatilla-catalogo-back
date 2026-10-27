import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Deja pasar la petición con o sin token JWT.
 * Si el token es válido, req.user contiene los datos del usuario.
 * Si no hay token o no es válido, req.user queda en null (no lanza UnauthorizedException).
 * Ideal para endpoints que admiten compras como invitado o usuario autenticado.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(_err: unknown, user: any) {
    return user || null;
  }
}
