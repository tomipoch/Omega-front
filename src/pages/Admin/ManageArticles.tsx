import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteArticle, getArticles } from '../../services/articlesService';
import { useConfirm } from '../../hooks/useConfirm';
import type { BlogArticulo } from '../../types';

const ManageArticles = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { confirm } = useConfirm();

  const articlesQuery = useQuery<BlogArticulo[]>({
    queryKey: ['articles-admin'],
    queryFn: getArticles,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteArticle(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['articles-admin'] }),
  });

  const handleEdit = (id: number) => navigate(`/admin/blog/edit/${id}`);
  const handleCreate = () => navigate('/admin/blog/new');

  const handleDelete = async (id: number) => {
    const ok = await confirm({
      title: 'Eliminar artículo',
      message: '¿Estás seguro de que deseas eliminar este artículo? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
    });
    if (!ok) return;
    deleteMutation.mutate(id);
  };

  if (articlesQuery.isLoading) {
    return <div className="text-center mt-10">Cargando artículos...</div>;
  }
  if (articlesQuery.error) {
    return (
      <div className="text-center text-red-500 mt-10" role="alert">
        {(articlesQuery.error as Error).message}
      </div>
    );
  }

  const articles = articlesQuery.data ?? [];

  return (
    <div className="max-w-6xl mx-auto p-4 font-ibm bg-white mt-8 mb-8">
      <h1 className="text-4xl font-semibold text-gray-800 mb-6">Gestión de Artículos</h1>
      <button
        type="button"
        onClick={handleCreate}
        className="bg-sgreen text-white py-2 px-4 rounded-2xl shadow-inner-green hover:shadow-inner-hgreen transition mb-4"
      >
        Crear Nuevo Artículo
      </button>
      <div className="overflow-x-auto rounded-2xl border border-gray-300">
        <table className="min-w-full table-auto border-collapse bg-white rounded-lg">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300">
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Título</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Fecha de Publicación
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {articles.length > 0 ? (
              articles.map((article) => (
                <tr
                  key={article.publicacion_id}
                  className="hover:bg-gray-50 border-b border-gray-300"
                >
                  <td className="px-6 py-3 text-gray-800">{article.titulo}</td>
                  <td className="px-6 py-3 text-gray-600">
                    {new Date(article.fecha_publicacion).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-3">
                    <button
                      type="button"
                      onClick={() => handleEdit(article.publicacion_id)}
                      className="bg-sgreen text-white py-2 px-4 rounded-2xl shadow-inner-green hover:shadow-inner-hgreen transition mr-2"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(article.publicacion_id)}
                      className="bg-white text-sgreen py-2 px-3 rounded-2xl border border-gray-300 hover:bg-gray-200 transition"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={3}
                  className="text-center py-6 text-gray-600 font-medium border-b border-gray-300"
                >
                  No hay artículos disponibles.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageArticles;