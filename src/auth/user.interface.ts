export enum UserRole {
  CLIENTE = 'cliente',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  nombre: string;
  email: string;
  password?: string;
  rol: UserRole;
  telefono?: string;
  createdAt: string;
}
