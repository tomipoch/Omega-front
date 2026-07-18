import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AiOutlineLoading } from 'react-icons/ai';
import logo from '../../assets/Logo.svg';
import { API_URL } from '../../services/apiClient';
import { motionWhile } from '../../utils/motion';

interface LocationState {
  email?: string;
}

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: (location.state as LocationState | null)?.email || '',
    codigo: '',
    nuevaContrasena: '',
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await fetch(`${API_URL}/usuarios/restablecer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correo_electronico: formData.email,
          codigo: formData.codigo,
          nuevaContrasena: formData.nuevaContrasena,
        }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error((errorData as { message?: string }).message || 'Error al restablecer la contraseña.');
      }

      setSuccessMessage('Tu contraseña ha sido restablecida exitosamente.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setErrorMessage((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen font-ibm flex items-center justify-center bg-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="bg-white p-8 rounded-2xl w-full max-w-sm"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <motion.img
          src={logo}
          alt="Logo"
          className="mx-auto mb-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
        <p className="text-center text-gray-500 mb-4">Ingresa tu código y nueva contraseña</p>
        {errorMessage && (
          <p className="text-red-500 text-center mb-4" role="alert">
            {errorMessage}
          </p>
        )}
        {successMessage && (
          <p className="text-green-500 text-center mb-4">{successMessage}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 p-2 border border-gray-300 rounded-2xl w-full"
              required
            />
          </div>
          <div>
            <label htmlFor="codigo" className="block text-sm font-medium text-gray-700">
              Código
            </label>
            <input
              id="codigo"
              type="text"
              name="codigo"
              value={formData.codigo}
              onChange={handleChange}
              className="mt-1 p-2 border border-gray-300 rounded-2xl w-full"
              required
            />
          </div>
          <div>
            <label htmlFor="nuevaContrasena" className="block text-sm font-medium text-gray-700">
              Nueva Contraseña
            </label>
            <input
              id="nuevaContrasena"
              type="password"
              name="nuevaContrasena"
              value={formData.nuevaContrasena}
              onChange={handleChange}
              className="mt-1 p-2 border border-gray-300 rounded-2xl w-full"
              required
            />
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full bg-sgreen text-white py-2 px-6 border-2 border-green-500 rounded-2xl shadow-inner-green hover:scale-105 hover:shadow-inner-hgreen transition disabled:opacity-60"
            whileHover={motionWhile(!loading, { scale: 1.05 })}
            whileTap={motionWhile(!loading, { scale: 0.95 })}
          >
            {loading ? (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                className="inline-block mr-2"
                aria-hidden="true"
              >
                <AiOutlineLoading size={20} />
              </motion.span>
            ) : (
              'Restablecer Contraseña'
            )}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ResetPassword;