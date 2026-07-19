import { z } from 'zod';

export const AuthUserSchema = z.object({
  usuario_id: z.number(),
  nombre: z.string(),
  token: z.string(),
  foto_perfil_url: z.string().nullable().optional(),
  rol_id: z.union([z.literal(1), z.literal(2)]),
});

export const LoginCredentialsSchema = z.object({
  correo_electronico: z.string().email(),
  contrasena: z.string().min(1),
});

export const LoginResponseSchema = z
  .object({
    usuario_id: z.number().optional(),
    userId: z.number().optional(),
    id: z.number().optional(),
    nombre: z.string().min(1),
    token: z.string().min(1),
    foto_perfil_url: z.string().nullable().optional(),
    rol_id: z.union([z.number(), z.string()]).transform((v) => Number(v)),
  })
  .transform((raw) => {
    const usuarioId = raw.usuario_id ?? raw.userId ?? raw.id;
    if (!usuarioId) {
      throw new z.ZodError([
        {
          code: 'custom',
          path: ['usuario_id'],
          message: 'La respuesta del servidor no incluye el identificador de usuario.',
        },
      ]);
    }
    return {
      usuario_id: usuarioId,
      nombre: raw.nombre,
      token: raw.token,
      foto_perfil_url: raw.foto_perfil_url ?? null,
      rol_id: raw.rol_id as 1 | 2,
    };
  });

export const RegisterPayloadSchema = z.object({
  nombre: z.string().min(1),
  apellido_paterno: z.string().min(1),
  apellido_materno: z.string().min(1),
  correo_electronico: z.string().email(),
  contrasena: z.string().min(8),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
});

export const ResetPasswordRequestSchema = z.object({
  correo_electronico: z.string().email(),
});

export const ResetPasswordConfirmSchema = z.object({
  correo_electronico: z.string().email(),
  codigo: z.string().min(1),
  nuevaContrasena: z.string().min(8),
});