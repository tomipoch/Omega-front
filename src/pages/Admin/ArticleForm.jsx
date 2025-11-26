import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SectionEditor from './SectionEditor';
import { Bounce, toast } from 'react-toastify';


const ArticleForm = ({ onSubmit, initialData }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState(initialData?.titulo || '');
  const [introduction, setIntroduction] = useState(initialData?.contenido || '');
  const [sections, setSections] = useState(initialData?.secciones || []);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id && !initialData) {
      const fetchArticle = async () => {
        try {
          const response = await fetch(`http://localhost:4000/blog/${id}`);
          if (!response.ok) throw new Error('Error al cargar el artículo');
          const data = await response.json();

          setTitle(data.titulo);
          setIntroduction(data.contenido);
          setSections(
            data.secciones?.map((section) => ({
              subtitle: section.subtitulo,
              content: section.contenido,
            })) || []
          );
        } catch (error) {
          setMessage(`Error: ${error.message}`);
        }
      };
      fetchArticle();
    }
  }, [id, initialData]);

  const handleSectionChange = (index, updatedSection) => {
    setSections((prev) =>
      prev.map((section, i) => (i === index ? updatedSection : section))
    );
  };

  const removeSection = (index) => {
    setSections((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTextareaResize = (e) => {
    e.target.style.height = 'auto'; // Reset height to calculate the new height
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const article = {
      titulo: title,
      contenido: introduction,
      secciones: sections
        .filter((section) => section.subtitle.trim() && section.content.trim())
        .map((section) => ({
          subtitulo: section.subtitle,
          contenido: section.content,
        })),
    };

    const token = sessionStorage.getItem('token');
    if (!token) {
      setMessage('Error: No se encontró un token. Por favor, inicia sesión.');
      setLoading(false);
      return;
    }

    try {
      const method = id ? 'PUT' : 'POST';
      const endpoint = id
        ? `http://localhost:4000/blog/${id}`
        : `http://localhost:4000/blog`;

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(article),
      });

      toast.success("Articulo Guardado Correctamente", {
        position: "top-right",
        theme: "colored"
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al guardar el artículo');
      }

      setMessage('Artículo guardado con éxito');
      navigate('/admin/blog');
    } catch (error) {
      setMessage(`Error: ${error.message}`);

      toast.error("Error al Guardar Articulo", {
        position: "top-right",
        theme: "colored"
      });

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
        >
          <span
            className={`material-icons ${
              message.includes('Error') ? 'text-red-500' : 'text-green-500'
            } mr-2`}
          >
            {message.includes('Error') ? 'error' : 'check_circle'}
          </span>
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
              rows="4"
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
                  rows="4"
                  required
                  style={{ minHeight: '100px' }}
                />
              </label>

              <button
                type="button"
                onClick={() => removeSection(index)}
                className="mt-4 bg-white border border-sgreen text-sgreen hover:bg-gray-200 rounded-2xl flex items-center px-4 py-2">
                Eliminar Sección
              </button>

            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              setSections([...sections, { subtitle: '', content: '' }])
            }
            className="bg-sgreen text-white py-2 px-4 border-2 border-green-500 rounded-2xl shadow-inner-green hover:shadow-inner-hgreen transition duration-300 ease-in-out">
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
                : 'bg-white text-sgreen border border-gray-300'
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
