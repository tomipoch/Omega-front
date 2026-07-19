import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  createArticle,
  getArticleById,
  updateArticle,
} from '../../services/articlesService';
import { ArticleFormFields } from '../../features/articles/ArticleFormFields';
import type { ArticleFormValues } from '../../features/articles/articleFormSchema';

const ArticleForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [message, setMessage] = useState('');

  const articleQuery = useQuery({
    queryKey: ['articles', id],
    queryFn: () => getArticleById(id ?? ''),
    enabled: isEditing,
  });

  useEffect(() => {
    if (!articleQuery.data) return;
  }, [articleQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async (values: ArticleFormValues) => {
      const payload = {
        titulo: values.titulo,
        contenido: values.contenido,
        secciones: values.secciones,
      };
      return isEditing && id
        ? updateArticle(Number(id), payload)
        : createArticle(payload);
    },
    onSuccess: () => {
      setMessage('Artículo guardado con éxito');
      navigate('/admin/blog');
    },
    onError: (err: Error) => setMessage(`Error: ${err.message}`),
  });

  if (articleQuery.isLoading && isEditing) {
    return <div className="text-center mt-10">Cargando artículo…</div>;
  }

  const initialValues: Partial<ArticleFormValues> | undefined = articleQuery.data
    ? {
        titulo: articleQuery.data.titulo,
        contenido: articleQuery.data.contenido,
        secciones:
          articleQuery.data.secciones?.map((s) => ({
            subtitulo: s.subtitulo,
            contenido: s.contenido,
          })) ?? [],
      }
    : undefined;

  return (
    <div className="max-w-4xl mx-auto p-8 font-ibm bg-white border border-gray-300 rounded-2xl mt-10 mb-10">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">
        {isEditing ? 'Editar Artículo' : 'Crear Nuevo Artículo'}
      </h1>

      {message && (
        <div
          className={`mb-4 p-4 rounded-lg flex items-center ${
            message.includes('Error')
              ? 'bg-red-100 text-red-700 border border-red-300'
              : 'bg-green-100 text-green-700 border border-green-300'
          }`}
          role="status"
        >
          {message}
        </div>
      )}

      <ArticleFormFields
        initialValues={initialValues}
        onSubmit={(values) => saveMutation.mutate(values)}
        isSubmitting={saveMutation.isPending}
        submitLabel={isEditing ? 'Actualizar Artículo' : 'Guardar Artículo'}
      />
    </div>
  );
};

export default ArticleForm;