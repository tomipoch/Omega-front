import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ServiceFormSchema,
  serviceDefaults,
  type ServiceFormValues,
} from './serviceFormSchema';

interface ServiceFormProps {
  initialValues?: Partial<ServiceFormValues>;
  onSubmit: (values: ServiceFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export const ServiceForm = ({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = 'Crear',
}: ServiceFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(ServiceFormSchema),
    defaultValues: { ...serviceDefaults, ...initialValues },
    mode: 'onBlur',
  });

  useEffect(() => {
    if (initialValues) reset({ ...serviceDefaults, ...initialValues });
  }, [initialValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4" noValidate>
      <div className="md:col-span-2">
        <label htmlFor="nombre_servicio" className="block text-sm font-medium text-gray-700 mb-1">
          Nombre del Servicio *
        </label>
        <input
          id="nombre_servicio"
          maxLength={255}
          autoComplete="off"
          {...register('nombre_servicio')}
          className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        {errors.nombre_servicio && (
          <p className="text-red-600 text-xs mt-1">{errors.nombre_servicio.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="precio" className="block text-sm font-medium text-gray-700 mb-1">
          Precio ($) *
        </label>
        <input
          id="precio"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          {...register('precio', {
            setValueAs: (v: string) => {
              if (v === '' || v === null || v === undefined) return Number.NaN;
              const normalized = String(v).replace(/\./g, '').replace(',', '.');
              return Number(normalized);
            },
          })}
          className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        {errors.precio && <p className="text-red-600 text-xs mt-1">{errors.precio.message}</p>}
      </div>

      <div>
        <label htmlFor="duracion_estimada" className="block text-sm font-medium text-gray-700 mb-1">
          Duración (minutos)
        </label>
        <input
          id="duracion_estimada"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          {...register('duracion_estimada', {
            setValueAs: (v: string) => {
              if (v === '' || v === null || v === undefined) return null;
              const parsed = parseInt(String(v), 10);
              return Number.isNaN(parsed) ? null : parsed;
            },
          })}
          className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        {errors.duracion_estimada && (
          <p className="text-red-600 text-xs mt-1">{errors.duracion_estimada.message}</p>
        )}
      </div>

      <div className="md:col-span-2">
        <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
          Descripción *
        </label>
        <textarea
          id="descripcion"
          rows={3}
          maxLength={1000}
          autoComplete="off"
          {...register('descripcion')}
          className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        {errors.descripcion && (
          <p className="text-red-600 text-xs mt-1">{errors.descripcion.message}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          {errors.descripcion ? '' : 'Máximo 1000 caracteres'}
        </p>
      </div>

      <div className="md:col-span-2 flex justify-end space-x-4">
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
          {isSubmitting ? 'Guardando…' : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default ServiceForm;