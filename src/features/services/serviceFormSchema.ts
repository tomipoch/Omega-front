import { z } from 'zod';

export const ServiceFormSchema = z.object({
  nombre_servicio: z.string().min(1, 'El nombre del servicio es obligatorio'),
  descripcion: z.string().min(1, 'La descripción es obligatoria'),
  precio: z
    .number({ message: 'El precio debe ser mayor a 0' })
    .positive('El precio debe ser mayor a 0'),
  duracion_estimada: z.number().int().positive('La duración debe ser mayor a 0').nullable(),
});

export type ServiceFormValues = z.infer<typeof ServiceFormSchema>;

export const serviceDefaults: ServiceFormValues = {
  nombre_servicio: '',
  descripcion: '',
  precio: 0,
  duracion_estimada: null,
};