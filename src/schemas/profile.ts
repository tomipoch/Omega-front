import { z } from 'zod';

export const ProfileResponseSchema = z.object({
  usuario_id: z.number(),
  nombre: z.string(),
  apellido_paterno: z.string().optional(),
  apellido_materno: z.string().optional(),
  correo_electronico: z.string(),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  foto_perfil_url: z.string().nullable().optional(),
  rol_id: z.number(),
  token: z.string().optional(),
});

export const ProfileUpdatePayloadSchema = z.object({
  nombre: z.string().min(1).optional(),
  apellido_paterno: z.string().min(1).optional(),
  apellido_materno: z.string().optional(),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
});