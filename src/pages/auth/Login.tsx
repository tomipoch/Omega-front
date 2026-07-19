import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUser } from '../../hooks/useUser';
import { isAdmin } from '../../constants/roles';
import { ROUTES } from '../../constants/routes';
import { LoginCredentialsSchema } from '../../schemas/auth';
import { login } from '../../services/authService';
import { motion } from 'framer-motion';
import { AiOutlineLoading, AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import logo from '../../assets/Logo.svg';
import googleLogo from '../../assets/google.png';
import { motionWhile } from '../../utils/motion';

interface LocationState {
  from?: { pathname?: string };
}

type LoginFormValues = {
  correo_electronico: string;
  contrasena: string;
};

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(LoginCredentialsSchema),
    defaultValues: { correo_electronico: '', contrasena: '' },
  });
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser } = useUser();

  const onSubmit = async (values: LoginFormValues) => {
    setError(null);
    try {
      const user = await login(values);
      loginUser(user);

      const state = (location.state ?? null) as LocationState | null;
      const redirectTo = state?.from?.pathname;
      if (redirectTo) {
        navigate(redirectTo, { replace: true });
      } else if (isAdmin(user.rol_id)) {
        navigate(ROUTES.ADMIN);
      } else {
        navigate(ROUTES.HOME);
      }
    } catch (err) {
      setError((err as Error).message || 'Error al iniciar sesión. Verifica tus credenciales.');
    }
  };

  const loading = isSubmitting;

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
        <p className="text-center text-gray-500 mb-4">Introduce tus datos para iniciar sesión</p>
        {error && (
          <p className="text-red-500 text-center mb-4" role="alert">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label
              htmlFor="correo_electronico"
              className="block text-sm font-medium text-gray-700"
            >
              Correo Electrónico
            </label>
            <input
              id="correo_electronico"
              type="email"
              placeholder="ejemplo@correo.com"
              autoComplete="email"
              {...register('correo_electronico')}
              aria-invalid={Boolean(errors.correo_electronico)}
              className="mt-1 p-2 border border-gray-300 rounded-2xl w-full"
            />
            {errors.correo_electronico && (
              <p className="text-red-600 text-xs mt-1" role="alert">
                {errors.correo_electronico.message}
              </p>
            )}
          </div>

          <div className="relative">
            <label htmlFor="contrasena" className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="contrasena"
                type={showPassword ? 'text' : 'password'}
                placeholder="Ingresa tu contraseña"
                autoComplete="current-password"
                {...register('contrasena')}
                aria-invalid={Boolean(errors.contrasena)}
                className="mt-1 p-2 pr-10 border border-gray-300 rounded-2xl w-full"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-3 flex items-center"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? (
                  <AiOutlineEyeInvisible size={20} className="text-gray-500" />
                ) : (
                  <AiOutlineEye size={20} className="text-gray-500" />
                )}
              </button>
            </div>
            {errors.contrasena && (
              <p className="text-red-600 text-xs mt-1" role="alert">
                {errors.contrasena.message}
              </p>
            )}
          </div>

          <Link to={ROUTES.FORGOT_PASSWORD} className="block text-sm text-center text-sgreen hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>

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
              'Iniciar Sesión'
            )}
          </motion.button>
        </form>

        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-300" />
          <span className="mx-2 text-gray-500">o</span>
          <div className="flex-grow border-t border-gray-300" />
        </div>

        <motion.button
          type="button"
          className="flex items-center justify-center w-full border border-gray-300 px-4 py-2 rounded-2xl hover:bg-gray-100 transition"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <img src={googleLogo} alt="Google" className="w-5 h-5 mr-2" />
          Iniciar sesión con Google
        </motion.button>

        <p className="text-center text-gray-500 mt-4">
          ¿No tienes una cuenta?{' '}
          <Link to={ROUTES.REGISTER} className="text-sgreen hover:underline">
            Regístrate
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
};

export default Login;