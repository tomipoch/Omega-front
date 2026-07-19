import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArticleFormSchema,
  articleDefaults,
  type ArticleFormValues,
} from './articleFormSchema';

interface ArticleFormFieldsProps {
  initialValues?: Partial<ArticleFormValues>;
  onSubmit: (values: ArticleFormValues) => void;
  isSubmitting?: boolean;
  submitLabel: string;
}

const SectionRow = ({ index, register, remove, errors }: {
  index: number;
  register: ReturnType<typeof useForm<ArticleFormValues>>['register'];
  remove: (i: number) => void;
  errors: ReturnType<typeof useForm<ArticleFormValues>>['formState']['errors'];
}) => {
  const subtitleError = errors.secciones?.[index]?.subtitulo?.message;
  const contentError = errors.secciones?.[index]?.contenido?.message;
  return (
    <div className="mb-6 border-b pb-6 border-gray-300">
      <label className="block">
        <span className="text-sm font-medium text-gray-700">Subtítulo</span>
        <input
          type="text"
          {...register(`secciones.${index}.subtitulo` as const)}
          className="mt-2 p-4 border border-gray-300 rounded-lg w-full focus:ring focus:ring-green-300"
        />
        {subtitleError && (
          <p className="text-red-600 text-xs mt-1" role="alert">
            {String(subtitleError)}
          </p>
        )}
      </label>

      <label className="block mt-4">
        <span className="text-sm font-medium text-gray-700">Contenido</span>
        <textarea
          rows={4}
          {...register(`secciones.${index}.contenido` as const)}
          style={{ minHeight: '100px' }}
          className="mt-2 p-4 border border-gray-300 rounded-lg w-full focus:ring focus:ring-green-300 overflow-hidden resize-none"
        />
        {contentError && (
          <p className="text-red-600 text-xs mt-1" role="alert">
            {String(contentError)}
          </p>
        )}
      </label>

      <button
        type="button"
        onClick={() => remove(index)}
        className="mt-4 bg-white border border-sgreen text-sgreen hover:bg-gray-200 rounded-2xl flex items-center px-4 py-2"
      >
        Eliminar Sección
      </button>
    </div>
  );
};

const autoResize = (e: React.FormEvent<HTMLTextAreaElement>) => {
  const target = e.currentTarget;
  target.style.height = 'auto';
  target.style.height = `${target.scrollHeight}px`;
};

export const ArticleFormFields = ({
  initialValues,
  onSubmit,
  isSubmitting = false,
  submitLabel,
}: ArticleFormFieldsProps) => {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ArticleFormValues>({
    resolver: zodResolver(ArticleFormSchema),
    defaultValues: { ...articleDefaults, ...initialValues },
    mode: 'onBlur',
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'secciones' });

  useEffect(() => {
    if (initialValues) reset({ ...articleDefaults, ...initialValues });
  }, [initialValues, reset]);

  const introError = errors.contenido?.message;
  const tituloError = errors.titulo?.message;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-6 mb-6">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Título</span>
          <input
            type="text"
            {...register('titulo')}
            className="mt-2 p-4 border border-gray-300 rounded-lg w-full focus:ring focus:ring-green-300"
          />
          {tituloError && (
            <p className="text-red-600 text-xs mt-1" role="alert">
              {tituloError}
            </p>
          )}
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Introducción</span>
          <textarea
            {...register('contenido')}
            onInput={autoResize}
            rows={4}
            style={{ minHeight: '100px' }}
            className="mt-2 p-4 border border-gray-300 rounded-lg w-full focus:ring focus:ring-green-300 overflow-hidden resize-none"
          />
          {introError && (
            <p className="text-red-600 text-xs mt-1" role="alert">
              {introError}
            </p>
          )}
        </label>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Secciones</h2>
        {fields.map((field, index) => (
          <SectionRow
            key={field.id}
            index={index}
            register={register}
            remove={remove}
            errors={errors}
          />
        ))}

        <button
          type="button"
          onClick={() => append({ subtitulo: '', contenido: '' })}
          className="bg-sgreen text-white py-2 px-4 border-2 border-green-500 rounded-2xl shadow-inner-green hover:shadow-inner-hgreen transition"
        >
          Agregar Sección
        </button>
      </div>

      <div className="flex">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`py-2 px-4 rounded-2xl transition-all ${
            isSubmitting
              ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
              : 'bg-white text-sgreen border border-gray-300 hover:bg-gray-100'
          }`}
        >
          {isSubmitting ? 'Guardando...' : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default ArticleFormFields;