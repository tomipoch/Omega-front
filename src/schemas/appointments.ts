import { z } from 'zod';

export const CitaSchema = z.object({
  cita_id: z.number(),
  usuario_id: z.number(),
  usuario_nombre: z.string().optional(),
  usuario_apellido: z.string().optional(),
  usuario_email: z.string().optional(),
  servicio_id: z.number(),
  servicio_nombre: z.string().optional(),
  servicio_precio: z.number().optional(),
  disponibilidad_id: z.number(),
  fecha: z.string(),
  hora_inicio: z.string(),
  hora_fin: z.string(),
  notas: z.string().optional(),
  estado_id: z.number().optional(),
  estado_nombre: z.string().optional(),
});

export const CitaListSchema = z.array(CitaSchema);

export const CitaFormDataSchema = z.object({
  usuario_id: z.union([z.number(), z.literal('')]).optional(),
  disponibilidad_id: z.number().int().positive(),
  servicio_id: z.number().int().positive(),
  notas: z.string().optional(),
});

export const ServicioSchema = z.object({
  servicio_id: z.number(),
  nombre_servicio: z.string(),
  descripcion: z.string().optional(),
  precio: z.number(),
  duracion_estimada: z.number().nullable().optional(),
});

export const ServicioListSchema = z.array(ServicioSchema);

export const SolicitudPersonalizacionPayloadSchema = z.object({
  usuario_id: z.number(),
  servicio_id: z.number().int().positive(),
  detalles: z.string().min(1),
});