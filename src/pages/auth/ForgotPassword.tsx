import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { AiOutlineLoading } from 'react-icons/ai';
import logo from '../../assets/Logo.svg';
import { requestPasswordReset } from '../../services/passwordResetService';
import { ROUTES } from '../../constants/routes';
import { ResetPasswordRequestSchema } from '../../schemas/auth';
import { motionWhile } from '../../utils/motion';

type ForgotFormValues = { correo_electronico: string };

const ForgotPassword = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(ResetPasswordRequestSchema),
    defaultValues: { correo_electronico: '' },
  });
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (values: ForgotFormValues) => {
    setErrorMessage('');
    try {
      await requestPasswordReset(values);
      navigate(ROUTES.RESET_PASSWORD, { state: { email: values.correo_electronico } });
    } catch (err) {
      setErrorMessage((err as Error).message);
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
        <p className="text-center text-gray-500 mb-4">
          Ingresa tu correo electrónico para recuperar tu contraseña
        </p>
        {errorMessage && (
          <p className="text-red-500 text-center mb-4" role="alert">
            {errorMessage}
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label htmlFor="correo_electronico" className="block text-sm font-medium text-gray-700">
              Correo Electrónico
            </label>
            <input
              id="correo_electronico"
              type="email"
              placeholder="ejemplo@correo.com"
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
              'Solicitar Código'
            )}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ForgotPassword;