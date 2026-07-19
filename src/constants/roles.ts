import type { Rol } from '../types';
import { ADMIN_ROL, USER_ROL } from '../types';

export const USER_ROL_NUMBER = USER_ROL;
export const ADMIN_ROL_NUMBER = ADMIN_ROL;

export const isAdmin = (rol: number | null | undefined): boolean =>
  Number(rol) === ADMIN_ROL_NUMBER;

export const isUser = (rol: number | null | undefined): boolean =>
  Number(rol) === USER_ROL_NUMBER;

export const hasRole = (rol: number | null | undefined, allowed: Rol[]): boolean =>
  allowed.includes(Number(rol) as Rol);