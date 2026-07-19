export const APPOINTMENT_STATUS = {
  CONFIRMED: 'CONFIRMED',
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type AppointmentStatus =
  (typeof APPOINTMENT_STATUS)[keyof typeof APPOINTMENT_STATUS];

export const APPOINTMENT_STATUS_COLORS: Record<AppointmentStatus, string> = {
  CONFIRMED: 'bg-green-100 text-green-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  CONFIRMED: 'Confirmada',
  PENDING: 'Pendiente',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
};

export const normalizeAppointmentStatus = (
  raw: string | null | undefined,
): AppointmentStatus => {
  const value = (raw ?? '').toLowerCase().trim();
  if (value.startsWith('conf') || value === 'confirmada' || value === 'confirmado')
    return APPOINTMENT_STATUS.CONFIRMED;
  if (value.startsWith('comp') || value === 'completada' || value === 'completado')
    return APPOINTMENT_STATUS.COMPLETED;
  if (value.startsWith('canc') || value === 'cancelada' || value === 'cancelado')
    return APPOINTMENT_STATUS.CANCELLED;
  return APPOINTMENT_STATUS.PENDING;
};