import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../hooks/useUser';
import { crearTestimonio } from '../../services/testimoniosService';

const FormTestimonials = () => {
  const [contenido, setContenido] = useState('');
  const [estrellas, setEstrellas] = useState(5);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { isAuthenticated, isAdmin } = useUser();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <section className="py-12 bg-white font-ibm">
        <div className="container mx-auto px-6 md:px-12 lg:px-48 text-center">
          <h1 className="text-3xl font-semibold text-gray-800 mb-4">Acceso Restringido</h1>
          <p className="text-red-500 mb-4">Debes iniciar sesión para crear reseñas.</p>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="bg-sgreen text-white py-2 px-4 rounded-lg"
          >
            Iniciar sesión
          </button>
        </div>
      </section>
    );
  }

  if (isAdmin) {
    return (
      <section className="py-12 bg-white font-ibm">
        <div className="container mx-auto px-6 md:px-12 lg:px-48 text-center">
          <h1 className="text-3xl font-semibold text-gray-800 mb-4">Acceso Restringido</h1>
          <p className="text-red-500 mb-4">Los administradores no pueden crear reseñas.</p>
          <button
            type="button"
            onClick={() => navigate('/testimonials')}
            className="bg-sgreen text-white py-2 px-4 rounded-lg"
          >
            Volver a Reseñas
          </button>
        </div>
      </section>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    try {
      await crearTestimonio({ contenido, estrellas });
      setSuccess(true);
      setTimeout(() => navigate('/testimonials'), 2000);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <section className="py-12 bg-white font-ibm">
      <div className="container mx-auto px-6 md:px-12 lg:px-48">
        <h1 className="text-3xl font-semibold text-gray-800 text-center mb-8">Crear Nueva Reseña</h1>

        {error && (
          <p className="text-center text-red-500 mb-4" role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className="text-center text-green-500 mb-4">
            Reseña creada exitosamente. Redirigiendo...
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 p-6 rounded-2xl shadow-md max-w-lg mx-auto"
        >
          <div className="mb-4">
            <label htmlFor="contenido" className="block text-sm font-medium text-gray-700 mb-2">
              Contenido de la reseña
            </label>
            <textarea
              id="contenido"
              name="contenido"
              rows={4}
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              className="block w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-sgreen focus:border-sgreen"
              placeholder="Escribe tu reseña aquí..."
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="estrellas" className="block text-sm font-medium text-gray-700 mb-2">
              Calificación
            </label>
            <select
              id="estrellas"
              name="estrellas"
              value={estrellas}
              onChange={(e) => setEstrellas(Number(e.target.value))}
              className="block w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-sgreen focus:border-sgreen"
            >
              <option value={5}>★★★★★ (5 estrellas)</option>
              <option value={4}>★★★★☆ (4 estrellas)</option>
              <option value={3}>★★★☆☆ (3 estrellas)</option>
              <option value={2}>★★☆☆☆ (2 estrellas)</option>
              <option value={1}>★☆☆☆☆ (1 estrella)</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-sgreen text-white py-2 px-4 rounded-lg shadow-inner-green hover:shadow-inner-hgreen transition duration-300"
          >
            Enviar Reseña
          </button>
        </form>
      </div>
    </section>
  );
};

export default FormTestimonials;