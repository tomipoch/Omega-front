import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '../../services/apiClient';
import type { BlogArticulo } from '../../types';

const ARTICLES_PER_PAGE = 5;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  exit: { opacity: 0 },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -50, transition: { duration: 0.5 } },
};

const Blog = () => {
  const [articles, setArticles] = useState<BlogArticulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const fetchArticles = async (page: number) => {
      setError('');
      setLoading(true);
      try {
        const response = await fetch(
          `${API_URL}/blog?limit=${ARTICLES_PER_PAGE}&page=${page}`,
        );
        if (!response.ok) throw new Error('Error al cargar los artículos');
        const data = await response.json();
        if (cancelled) return;
        setArticles(data.articles || []);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(page);
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchArticles(currentPage);
    return () => {
      cancelled = true;
    };
  }, [currentPage]);

  const handlePageChange = (next: number) => {
    if (next < 1 || next > totalPages) return;
    setCurrentPage(next);
  };

  if (error) {
    return (
      <div className="text-center text-red-500 mt-10" role="alert">
        {error}
      </div>
    );
  }

  return (
    <section className="py-12 bg-white font-ibm">
      <div className="container mx-auto px-6 md:px-12 lg:px-48">
        <h1 className="text-5xl font-semibold text-center mb-10 mt-10 text-gray-800">
          Blog y Artículos Informativos
        </h1>
        <p className="text-lg text-gray-700 text-left mb-8">
          Bienvenido a nuestro blog, el espacio donde compartimos las últimas novedades, consejos y
          tendencias del mundo de la relojería y la joyería. Aquí encontrarás artículos exclusivos
          escritos por expertos que te ayudarán a conocer más sobre el cuidado, la historia y las
          innovaciones de tus piezas favoritas.
        </p>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={containerVariants}
          >
            {loading ? (
              <p className="col-span-full text-center text-gray-500">Cargando artículos...</p>
            ) : articles.length === 0 ? (
              <p className="col-span-full text-center text-gray-500">No hay artículos.</p>
            ) : (
              articles.map((article) => (
                <motion.article
                  key={article.publicacion_id}
                  className="bg-white hover:bg-gray-100 transition-colors duration-200 rounded-2xl p-4 cursor-pointer border border-gray-200 shadow-sm flex flex-col justify-between"
                  style={{ height: '250px' }}
                  variants={cardVariants}
                >
                  <div className="flex-grow">
                    <h2 className="text-lg font-medium text-gray-700 mb-1 line-clamp-2">
                      {article.titulo}
                    </h2>
                    <p className="text-gray-600 text-xs mb-2">
                      Publicado el: {new Date(article.fecha_publicacion).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                      {article.contenido}
                    </p>
                  </div>
                  <motion.button
                    type="button"
                    className="bg-sgreen text-white py-1 px-3 text-sm border-2 border-green-500 rounded-2xl shadow-inner-green hover:shadow-inner-hgreen transition duration-300 ease-in-out mt-4"
                    onClick={() => navigate(`/blog/${article.publicacion_id}`)}
                    whileHover={currentPage > 1 ? { scale: 1.05 } : undefined}
                    whileTap={currentPage > 1 ? { scale: 0.95 } : undefined}
                  >
                    Leer más
                  </motion.button>
                </motion.article>
              ))
            )}
          </motion.div>
        </AnimatePresence>

        <nav
          className="flex justify-center items-center mt-10 space-x-4"
          aria-label="Paginación del blog"
        >
          <motion.button
            type="button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`py-1 px-3 text-sm border-2 rounded-2xl transition duration-300 ease-in-out ${
              currentPage === 1
                ? 'bg-white text-gray-500 border-gray-200 cursor-not-allowed'
                : 'bg-sgreen text-white border-green-500 hover:shadow-inner-hgreen'
            }`}
            whileHover={currentPage > 1 ? { scale: 1.05 } : undefined}
            whileTap={currentPage > 1 ? { scale: 0.95 } : undefined}
          >
            Anterior
          </motion.button>
          <span className="text-gray-700 text-lg">
            Página {currentPage} de {totalPages}
          </span>
          <motion.button
            type="button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className={`py-1 px-3 text-sm border-2 rounded-2xl transition duration-300 ease-in-out ${
              currentPage >= totalPages
                ? 'bg-white text-gray-500 border-gray-200 cursor-not-allowed'
                : 'bg-sgreen text-white border-green-500 hover:shadow-inner-hgreen'
            }`}
            whileHover={currentPage < totalPages ? { scale: 1.05 } : undefined}
            whileTap={currentPage < totalPages ? { scale: 0.95 } : undefined}
          >
            Siguiente
          </motion.button>
        </nav>
      </div>
    </section>
  );
};

export default Blog;