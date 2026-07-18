import { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../services/authContext';
import Modal from '../../components/Modal';
import { extractList, API_URL } from '../../services/apiClient';
import type { BlogArticulo } from '../../types';

interface ArticlesResponse {
  articles: BlogArticulo[];
}

const ManageArticles = () => {
  const { token } = useContext(AuthContext);
  const [articles, setArticles] = useState<BlogArticulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<number | null>(null);
  const navigate = useNavigate();

  const fetchArticles = useCallback(async () => {
    try {
      if (!token) throw new Error('Usuario no autenticado. Inicia sesión nuevamente.');
      const res = await fetch(`${API_URL}/blog`, {
        headers: { 'x-auth-token': token },
      });
      if (!res.ok) throw new Error('Error al cargar los artículos');
      const data = (await res.json()) as ArticlesResponse | BlogArticulo[];
      setArticles(extractList<BlogArticulo>(data));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const toggleModal = () => setShowModal((v) => !v);

  const confirmDelete = async () => {
    if (articleToDelete === null) return;
    try {
      const res = await fetch(`${API_URL}/blog/${articleToDelete}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token ?? '' },
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error((errorData as { message?: string }).message || 'No se pudo eliminar el artículo.');
      }
      setArticles((prev) => prev.filter((a) => a.publicacion_id !== articleToDelete));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      toggleModal();
    }
  };

  const requestDelete = (id: number) => {
    setArticleToDelete(id);
    setShowModal(true);
  };

  const handleEdit = (id: number) => navigate(`/admin/blog/edit/${id}`);
  const handleCreate = () => navigate('/admin/blog/new');

  if (loading) return <div className="text-center mt-10">Cargando artículos...</div>;
  if (error)
    return (
      <div className="text-center text-red-500 mt-10" role="alert">
        {error}
      </div>
    );

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
                      onClick={() => requestDelete(article.publicacion_id)}
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
      <Modal
        showModal={showModal}
        toggleModal={toggleModal}
        onConfirm={confirmDelete}
        title="Eliminar artículo"
        message="¿Estás seguro de que deseas eliminar este artículo? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default ManageArticles;