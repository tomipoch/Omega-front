import { z } from 'zod';

export const AppointmentFormSchema = z.object({
  usuario_id: z.union([z.number().int().positive(), z.literal('')]).optional(),
  disponibilidad_id: z
    .number()
    .int()
    .positive('Selecciona un horario'),
  servicio_id: z
    .number()
    .int()
    .positive('Selecciona un servicio'),
  notas: z.string().max(500, 'Máximo 500 caracteres').optional(),
});

export type AppointmentFormValues = z.infer<typeof AppointmentFormSchema>;

export const appointmentDefaults: AppointmentFormValues = {
  usuario_id: '',
  disponibilidad_id: 0,
  servicio_id: 0,
  notas: '',
};