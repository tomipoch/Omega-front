import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AppointmentFormSchema,
  appointmentDefaults,
  type AppointmentFormValues,
} from './appointmentFormSchema';
import { formatDate, formatTime } from '../../services/availabilityService';
import type { Cita, Servicio, Disponibilidad } from '../../types';
import type { Usuario } from '../../services/usersService';

interface AppointmentFormProps {
  editingCita: Cita | null;
  servicios: Servicio[];
  usuarios?: Usuario[];
  disponibilidades: Disponibilidad[];
  onSubmit: (values: AppointmentFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  isAdmin?: boolean;
  errorMessage?: string;
}

const optionValue = (v: number | '' | undefined): string =>
  v === '' || v === undefined ? '' : String(v);

export const AppointmentForm = ({
  editingCita,
  servicios,
  usuarios = [],
  disponibilidades,
  onSubmit,
  onCancel,
  isSubmitting = false,
  isAdmin = false,
  errorMessage,
}: AppointmentFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<AppointmentFormValues>({
    resolver: zodResolver(AppointmentFormSchema),
    defaultValues: appointmentDefaults,
    mode: 'onBlur',
  });

  useEffect(() => {
    if (editingCita) {
      reset({
        usuario_id: editingCita.usuario_id ?? '',
        disponibilidad_id: editingCita.disponibilidad_id ?? 0,
        servicio_id: editingCita.servicio_id ?? 0,
        notas: editingCita.notas ?? '',
      });
    } else {
      reset(appointmentDefaults);
    }
  }, [editingCita, reset]);

  const grouped = disponibilidades.reduce<Record<string, Disponibilidad[]>>((acc, d) => {
    if (!d?.fecha) return acc;
    (acc[d.fecha] ??= []).push(d);
    return acc;
  }, {});

  const editingFecha = editingCita?.fecha;
  const editingHoraInicio = editingCita?.hora_inicio;
  const editingHoraFin = editingCita?.hora_fin;
  const selectedDispId = watch('disponibilidad_id');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {errorMessage && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
          role="alert"
        >
          {errorMessage}
        </div>
      )}

      {isAdmin && (
        <div>
          <label
            htmlFor="usuario_id"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Usuario *
          </label>
          <select
            id="usuario_id"
            {...register('usuario_id')}
            className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Selecciona un usuario</option>
            {usuarios.map((u) => (
              <option key={u.usuario_id} value={u.usuario_id}>
                {`${u.nombre} ${u.apellido_paterno} - ${u.correo_electronico}`}
              </option>
            ))}
          </select>
          {errors.usuario_id && (
            <p className="text-red-600 text-xs mt-1">{errors.usuario_id.message}</p>
          )}
        </div>
      )}

      <div>
        <label htmlFor="servicio_id" className="block text-sm font-medium text-gray-700 mb-1">
          Servicio *
        </label>
        <select
          id="servicio_id"
          {...register('servicio_id', { valueAsNumber: true })}
          className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value={optionValue(0)}>Selecciona un servicio</option>
          {servicios.map((s) => (
            <option key={s.servicio_id} value={optionValue(s.servicio_id)}>
              {`${s.nombre_servicio} - $${s.precio} - ${s.descripcion}`}
            </option>
          ))}
        </select>
        {errors.servicio_id && (
          <p className="text-red-600 text-xs mt-1">{errors.servicio_id.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="disponibilidad_id"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Fecha y Hora Disponible *
        </label>
        {editingCita && editingFecha && editingHoraInicio && editingHoraFin && (
          <p className="text-sm text-blue-600 mb-2">
            {`Tu horario actual: ${formatDate(editingFecha)} de ${formatTime(editingHoraInicio)} a ${formatTime(editingHoraFin)}. Puedes mantenerlo o elegir uno nuevo.`}
          </p>
        )}
        <select
          id="disponibilidad_id"
          {...register('disponibilidad_id', { valueAsNumber: true })}
          className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value={optionValue(0)}>Seleccionar horario</option>
          {Object.entries(grouped).map(([fecha, slots]) => (
            <optgroup key={fecha} label={`📅 ${formatDate(fecha)}`}>
              {slots.map((d) => (
                <option key={d.disponibilidad_id} value={optionValue(d.disponibilidad_id)}>
                  {`${formatTime(d.hora_inicio)} - ${formatTime(d.hora_fin)}`}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        {errors.disponibilidad_id && (
          <p className="text-red-600 text-xs mt-1">{errors.disponibilidad_id.message}</p>
        )}
        {selectedDispId === 0 && (
          <p className="text-xs text-gray-500 mt-1">Selecciona una fecha y hora para continuar.</p>
        )}
      </div>

      <div>
        <label htmlFor="notas" className="block text-sm font-medium text-gray-700 mb-1">
          Notas (opcional)
        </label>
        <textarea
          id="notas"
          rows={3}
          {...register('notas')}
          className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        {errors.notas && (
          <p className="text-red-600 text-xs mt-1">{errors.notas.message}</p>
        )}
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="py-2 px-4 text-sm border-2 rounded-lg bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="py-2 px-4 text-sm border-2 rounded-lg bg-sgreen text-white border-green-500 hover:bg-green-600 disabled:opacity-60"
        >
          {isSubmitting ? 'Guardando…' : editingCita ? 'Actualizar Cita' : 'Crear Cita'}
        </button>
      </div>
    </form>
  );
};

export default AppointmentForm;