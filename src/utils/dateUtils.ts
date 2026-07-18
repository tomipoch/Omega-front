// Utilities para manejo de fechas sin problemas de timezone

const pad = (n: number): string => String(n).padStart(2, '0');

export const formatDateForBackend = (date: Date): string => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new Error('Se requiere una fecha válida');
  }
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

export const formatDateForDisplay = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getTodayDateString = (): string => {
  const today = new Date();
  return `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
};

export const createDateFromParts = (
  dateInput: string | Date,
  hour: number | string,
  minute: number | string = 0,
): Date => {
  if (!dateInput || hour === undefined || hour === null) {
    throw new Error('Se requiere fecha y hora');
  }

  const date =
    dateInput instanceof Date ? new Date(dateInput.getTime()) : new Date(dateInput);

  if (Number.isNaN(date.getTime())) {
    throw new Error('Fecha inválida');
  }

  date.setHours(Number(hour), Number(minute) || 0, 0, 0);
  return date;
};