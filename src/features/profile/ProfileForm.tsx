import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ProfileFormSchema,
  profileDefaults,
  type ProfileFormValues,
} from './profileFormSchema';

interface ProfileFormProps {
  initialValues?: Partial<ProfileFormValues>;
  onSubmit: (values: ProfileFormValues) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

interface ProfileFieldProps {
  label: string;
  name: keyof ProfileFormValues;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  disabledMessage?: string;
  error?: string;
  register: ReturnType<typeof useForm<ProfileFormValues>>['register'];
  value: string;
}

const ProfileField = ({
  label,
  name,
  type = 'text',
  required = false,
  disabled = false,
  disabledMessage,
  error,
  register,
  value,
}: ProfileFieldProps) => (
  <div>
    <label htmlFor={name} className="block text-gray-600">
      {label}
    </label>
    <input
      id={name}
      type={type}
      disabled={disabled}
      required={required && !disabled}
      title={disabledMessage}
      {...register(name)}
      className={`w-full p-2 mt-1 border rounded-2xl transition-all duration-300 ${
        disabled
          ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed'
          : 'border-gray-300 focus:border-sgreen focus:ring-1 focus:ring-sgreen'
      }`}
      defaultValue={value}
    />
    {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
  </div>
);

export const ProfileForm = ({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ProfileFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(ProfileFormSchema),
    defaultValues: { ...profileDefaults, ...initialValues },
    mode: 'onBlur',
  });

  useEffect(() => {
    if (initialValues) reset({ ...profileDefaults, ...initialValues });
  }, [initialValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProfileField
          label="Nombre"
          name="nombre"
          register={register}
          value={initialValues?.nombre ?? ''}
          required
          error={errors.nombre?.message}
        />
        <ProfileField
          label="Apellido Paterno"
          name="apellido_paterno"
          register={register}
          value={initialValues?.apellido_paterno ?? ''}
          required
          error={errors.apellido_paterno?.message}
        />
        <ProfileField
          label="Apellido Materno"
          name="apellido_materno"
          register={register}
          value={initialValues?.apellido_materno ?? ''}
        />
        <ProfileField
          label="Correo Electrónico"
          name="correo_electronico"
          type="email"
          register={register}
          value={initialValues?.correo_electronico ?? ''}
          required
          disabled
          disabledMessage="El correo no se puede editar"
          error={errors.correo_electronico?.message}
        />
        <ProfileField
          label="Teléfono"
          name="telefono"
          register={register}
          value={initialValues?.telefono ?? ''}
        />
        <ProfileField
          label="Dirección"
          name="direccion"
          register={register}
          value={initialValues?.direccion ?? ''}
        />
      </div>
      <div className="flex justify-end space-x-4 mt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-white border border-sgreen text-sgreen py-2 px-6 rounded-2xl hover:bg-sgreen/15 transition"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={!isDirty || isSubmitting}
          className="bg-sgreen text-white py-2 px-6 border-2 border-green-500 rounded-2xl shadow-inner-green hover:scale-105 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Guardando…' : 'Guardar Cambios'}
        </button>
      </div>
    </form>
  );
};

export default ProfileForm;