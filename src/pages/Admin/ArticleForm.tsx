import { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../../services/authContext';
import { API_URL } from '../../services/apiClient';
import type { BlogArticulo } from '../../types';

interface Section {
  subtitle: string;
  content: string;
}

interface ArticleFormProps {
  initialData?: BlogArticulo;
}

const ArticleForm = ({ initialData }: ArticleFormProps = {}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [title, setTitle] = useState(initialData?.titulo || '');
  const [introduction, setIntroduction] = useState(initialData?.contenido || '');
  const [sections, setSections] = useState<Section[]>(
    initialData?.secciones?.map((s) => ({ subtitle: s.subtitulo, content: s.contenido })) || [],
  );
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id || initialData) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/blog/${id}`, {
          headers: token ? { 'x-auth-token': token } : {},
        });
        if (!res.ok) throw new Error('Error al cargar el artículo');
        const data = (await res.json()) as BlogArticulo;
        if (cancelled) return;
        setTitle(data.titulo || '');
        setIntroduction(data.contenido || '');
        setSections(
          data.secciones?.map((section) => ({
            subtitle: section.subtitulo,
            content: section.contenido,
          })) || [],
        );
      } catch (err) {
        if (!cancelled) setMessage(`Error: ${(err as Error).message}`);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, initialData, token]);

  const handleSectionChange = (index: number, updatedSection: Section) =>
    setSections((prev) => prev.map((s, i) => (i === index ? updatedSection : s)));

  const removeSection = (index: number) =>
    setSections((prev) => prev.filter((_, i) => i !== index));

  const handleTextareaResize = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    target.style.height = 'auto';
    target.style.height = `${target.scrollHeight}px`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const article = {
      titulo: title,
      contenido: introduction,
      secciones: sections
        .filter((s) => s.subtitle?.trim() && s.content?.trim())
        .map((s) => ({ subtitulo: s.subtitle, contenido: s.content })),
    };

    if (!token) {
      setMessage('Error: No se encontró un token. Por favor, inicia sesión.');
      setLoading(false);
      return;
    }

    try {
      const url = id ? `${API_URL}/blog/${id}` : `${API_URL}/blog`;
      const res = await fetch(url, {
        method: id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify(article),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          (errorData as { message?: string }).message || 'Error al guardar el artículo',
        );
      }
      setMessage('Artículo guardado con éxito');
      navigate('/admin/blog');
    } catch (err) {
      setMessage(`Error: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 font-ibm bg-white border border-gray-300 rounded-2xl mt-10 mb-10">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">
        {id ? 'Editar Artículo' : 'Crear Nuevo Artículo'}
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

      <form onSubmit={handleSubmit}>
        <div className="space-y-6 mb-6">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Título</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-2 p-4 border border-gray-300 rounded-lg w-full focus:ring focus:ring-green-300"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Introducción</span>
            <textarea
              value={introduction}
              onChange={(e) => setIntroduction(e.target.value)}
              onInput={handleTextareaResize}
              className="mt-2 p-4 border border-gray-300 rounded-lg w-full focus:ring focus:ring-green-300 overflow-hidden resize-none"
              rows={4}
              required
              style={{ minHeight: '100px' }}
            />
          </label>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Secciones</h2>
          {sections.map((section, index) => (
            <div key={index} className="mb-6 border-b pb-6 border-gray-300">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Subtítulo</span>
                <input
                  type="text"
                  value={section.subtitle}
                  onChange={(e) =>
                    handleSectionChange(index, { ...section, subtitle: e.target.value })
                  }
                  className="mt-2 p-4 border border-gray-300 rounded-lg w-full focus:ring focus:ring-green-300"
                  required
                />
              </label>

              <label className="block mt-4">
                <span className="text-sm font-medium text-gray-700">Contenido</span>
                <textarea
                  value={section.content}
                  onChange={(e) =>
                    handleSectionChange(index, { ...section, content: e.target.value })
                  }
                  onInput={handleTextareaResize}
                  className="mt-2 p-4 border border-gray-300 rounded-lg w-full focus:ring focus:ring-green-300 overflow-hidden resize-none"
                  rows={4}
                  required
                  style={{ minHeight: '100px' }}
                />
              </label>

              <button
                type="button"
                onClick={() => removeSection(index)}
                className="mt-4 bg-white border border-sgreen text-sgreen hover:bg-gray-200 rounded-2xl flex items-center px-4 py-2"
              >
                Eliminar Sección
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => setSections((prev) => [...prev, { subtitle: '', content: '' }])}
            className="bg-sgreen text-white py-2 px-4 border-2 border-green-500 rounded-2xl shadow-inner-green hover:shadow-inner-hgreen transition"
          >
            Agregar Sección
          </button>
        </div>

        <div className="flex">
          <button
            type="submit"
            disabled={loading}
            className={`py-2 px-4 rounded-2xl transition-all ${
              loading
                ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                : 'bg-white text-sgreen border border-gray-300 hover:bg-gray-100'
            }`}
          >
            {loading ? 'Guardando...' : id ? 'Actualizar Artículo' : 'Guardar Artículo'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ArticleForm;