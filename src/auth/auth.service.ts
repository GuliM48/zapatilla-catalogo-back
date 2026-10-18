import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { FirebaseService } from '../firebase/firebase.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { UserRole } from './user.interface.js';

@Injectable()
export class AuthService {
  private collectionName = 'usuarios';

  constructor(
    private firebaseService: FirebaseService,
    private jwtService: JwtService,
  ) {}

  private get collection() {
    return this.firebaseService.getFirestore().collection(this.collectionName);
  }

  async register(registerDto: RegisterDto) {
    const { email, password, nombre, rol, telefono } = registerDto;

    // Check if user email already exists in Firestore
    const existingSnapshot = await this.collection
      .where('email', '==', email.toLowerCase())
      .get();

    if (!existingSnapshot.empty) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    // Hash password with bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const now = new Date().toISOString();
    const newUser = {
      nombre,
      email: email.toLowerCase(),
      password: hashedPassword,
      rol: rol || UserRole.CLIENTE,
      telefono: telefono || '',
      createdAt: now,
    };

    const docRef = await this.collection.add(newUser);

    const payload = {
      sub: docRef.id,
      email: newUser.email,
      rol: newUser.rol,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      message: 'Usuario registrado exitosamente',
      user: {
        id: docRef.id,
        nombre: newUser.nombre,
        email: newUser.email,
        rol: newUser.rol,
        telefono: newUser.telefono,
      },
      accessToken,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const snapshot = await this.collection
      .where('email', '==', email.toLowerCase())
      .get();

    if (snapshot.empty) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    const isPasswordMatching = await bcrypt.compare(
      password,
      userData.password,
    );

    if (!isPasswordMatching) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = {
      sub: userDoc.id,
      email: userData.email,
      rol: userData.rol,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      message: 'Inicio de sesión exitoso',
      user: {
        id: userDoc.id,
        nombre: userData.nombre,
        email: userData.email,
        rol: userData.rol,
        telefono: userData.telefono,
      },
      accessToken,
    };
  }
}
