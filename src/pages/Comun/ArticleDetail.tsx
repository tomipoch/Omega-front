import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { API_URL } from '../../services/apiClient';
import type { BlogArticulo } from '../../types';

const ArticleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<BlogArticulo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/blog/${id}`);
        if (!res.ok) throw new Error('Error al cargar el artículo');
        const data = await res.json();
        if (!cancelled) setArticle(data as BlogArticulo);
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <div className="text-center mt-10">Cargando...</div>;
  if (error)
    return (
      <div className="text-center text-red-500 mt-10" role="alert">
        {error}
      </div>
    );
  if (!article) return <div className="text-center mt-10">No se encontró el artículo</div>;

  return (
    <motion.section
      className="py-12 bg-white font-ibm container mx-auto px-6 md:px-12 lg:px-48"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-semibold text-gray-800">{article.titulo}</h1>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-sgreen text-white py-2 px-4 border-2 border-green-500 rounded-2xl shadow-inner-green hover:shadow-inner-hgreen transition"
          >
            Volver Atrás
          </button>
        </div>
        <p className="text-gray-600 text-sm mb-4">
          Publicado el: {new Date(article.fecha_publicacion).toLocaleDateString()}
        </p>
        <p className="text-gray-700 leading-relaxed mb-6">{article.contenido}</p>
        {article.secciones && article.secciones.length > 0 && (
          <div className="space-y-6">
            {article.secciones.map((section) => (
              <div key={section.seccion_id} className="mb-4">
                <h2 className="text-2xl font-bold mb-2">{section.subtitulo}</h2>
                <p className="text-gray-700 leading-relaxed">{section.contenido}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.section>
  );
};

export default ArticleDetail;