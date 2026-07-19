import { z } from 'zod';

export const ProfileFormSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  apellido_paterno: z.string().min(1, 'El apellido paterno es obligatorio'),
  apellido_materno: z.string(),
  correo_electronico: z.string().email('Correo inválido'),
  telefono: z.string(),
  direccion: z.string(),
});

export type ProfileFormValues = z.infer<typeof ProfileFormSchema>;

export const profileDefaults: ProfileFormValues = {
  nombre: '',
  apellido_paterno: '',
  apellido_materno: '',
  correo_electronico: '',
  telefono: '',
  direccion: '',
};