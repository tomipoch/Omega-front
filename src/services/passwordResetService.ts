import { apiPost } from './apiClient';
import type { ResetPasswordRequest, ResetPasswordConfirm } from '../types';

export const requestPasswordReset = (data: ResetPasswordRequest): Promise<unknown> =>
  apiPost('/usuarios/restablecer-solicitud', data, { skipAuth: true });

export const confirmPasswordReset = (data: ResetPasswordConfirm): Promise<unknown> =>
  apiPost('/usuarios/restablecer', data, { skipAuth: true });