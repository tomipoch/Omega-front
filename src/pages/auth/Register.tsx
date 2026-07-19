import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cropper from 'react-easy-crop';
import { motion } from 'framer-motion';
import { FaHome } from 'react-icons/fa';
import logo from '../../assets/Logo.svg';
import userImageDefault from '../../assets/userdefect.png';
import { register } from '../../services/authService';
import { getCroppedImg, type CropArea } from '../../utils/cropImage';
import { motionWhile } from '../../utils/motion';

interface RegisterFormData {
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  correo_electronico: string;
  contrasena: string;
  confirmarContrasena: string;
  telefono: string;
  direccion: string;
}

const emptyForm: RegisterFormData = {
  nombre: '',
  apellido_paterno: '',
  apellido_materno: '',
  correo_electronico: '',
  contrasena: '',
  confirmarContrasena: '',
  telefono: '',
  direccion: '',
};

const buildPayload = (form: RegisterFormData): FormData => {
  const fd = new FormData();
  Object.entries(form).forEach(([key, value]) => {
    if (key === 'confirmarContrasena') return;
    fd.append(key, value ?? '');
  });
  return fd;
};

const InputField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
}) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      id={name}
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="mt-1 p-2 border border-gray-300 rounded-2xl w-full"
    />
  </div>
);

const SubmitButton = ({
  children,
  disabled = false,
}: {
  children: React.ReactNode;
  disabled?: boolean;
}) => (
  <motion.button
    type="submit"
    disabled={disabled}
    className="w-full bg-sgreen text-white py-2 px-6 border-2 border-green-500 rounded-2xl shadow-inner-green hover:scale-105 transition disabled:opacity-60"
    whileHover={motionWhile(!disabled, { scale: 1.05 })}
    whileTap={motionWhile(!disabled, { scale: 0.95 })}
  >
    {children}
  </motion.button>
);

const Register = () => {
  const [formData, setFormData] = useState<RegisterFormData>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropArea, setCropArea] = useState<CropArea | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const hiddenFileInput = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const [isRegistered, setIsRegistered] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
      setShowCropper(true);
    }
  };

  const handleSaveCroppedImage = async () => {
    if (!profileImage || !cropArea) return;
    try {
      const croppedImg = await getCroppedImg(profileImage, cropArea);
      setCroppedImage(croppedImg);
      setShowCropper(false);
    } catch {
      setError('Error al recortar la imagen.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 1) {
      if (formData.nombre && formData.apellido_paterno && formData.apellido_materno) {
        setError(null);
        setStep(2);
      } else {
        setError('Completa nombre y apellidos.');
      }
    } else if (step === 2) {
      if (formData.contrasena.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres.');
        return;
      }
      if (formData.contrasena !== formData.confirmarContrasena) {
        setError('Las contraseñas no coinciden.');
        return;
      }
      setError(null);
      setStep(3);
    } else {
      try {
        setIsLoading(true);
        const fd = buildPayload(formData);
        if (croppedImage) {
          const response = await fetch(croppedImage);
          const blob = await response.blob();
          fd.append('foto_perfil', blob, 'profile.jpg');
        }
        await register(fd);
        setIsRegistered(true);
      } catch (err) {
        setError((err as Error).message || 'Error al registrar usuario.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!isRegistered) return undefined;
    const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [isRegistered]);

  useEffect(() => {
    if (isRegistered && countdown <= 0) navigate('/login');
  }, [isRegistered, countdown, navigate]);

  const renderProgressIndicator = () => (
    <div className="flex justify-center items-center mb-6">
      {[1, 2, 3].map((stepNum) => (
        <div key={stepNum} className="flex items-center">
          <div
            className={`rounded-full h-8 w-8 flex items-center justify-center text-xs font-bold transition-colors duration-300 ${
              step >= stepNum ? 'bg-sgreen text-white' : 'bg-gray-300 text-gray-600'
            }`}
          >
            {stepNum}
          </div>
          {stepNum < 3 && (
            <div
              className={`h-1 w-8 sm:w-12 lg:w-16 transition-colors duration-300 ${
                step > stepNum ? 'bg-sgreen' : 'bg-gray-300'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <motion.div
      className="min-h-screen font-ibm flex items-center justify-center bg-white relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="bg-white p-8 rounded-2xl w-full max-w-sm mt-4"
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

        {isRegistered ? (
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h2 className="text-2xl font-bold mb-4">¡Registro exitoso!</h2>
            <p>Te redirigiremos al inicio de sesión en {countdown} segundos...</p>
            <motion.button
              type="button"
              onClick={() => navigate('/login')}
              className="mt-4 bg-sgreen text-white px-4 py-2 rounded-2xl hover:bg-green-600"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Ir al Login ahora
            </motion.button>
          </motion.div>
        ) : (
          <>
            <div className="relative flex items-center mb-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="bg-sgreen text-white p-2 rounded-full hover:bg-bgreen absolute left-0"
                aria-label="Volver al inicio"
              >
                <FaHome className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-bold text-center w-full">Regístrate</h2>
            </div>

            {renderProgressIndicator()}

            {error && (
              <p className="text-red-500 text-center mb-4" role="alert">
                {error}
              </p>
            )}

            <motion.form
              onSubmit={handleSubmit}
              className="space-y-3"
              encType="multipart/form-data"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {step === 1 && (
                <>
                  <InputField
                    label="Nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                  />
                  <InputField
                    label="Apellido Paterno"
                    name="apellido_paterno"
                    value={formData.apellido_paterno}
                    onChange={handleChange}
                    required
                  />
                  <InputField
                    label="Apellido Materno"
                    name="apellido_materno"
                    value={formData.apellido_materno}
                    onChange={handleChange}
                    required
                  />
                  <SubmitButton>Siguiente</SubmitButton>
                </>
              )}

              {step === 2 && (
                <>
                  <InputField
                    label="Correo Electrónico"
                    name="correo_electronico"
                    type="email"
                    value={formData.correo_electronico}
                    onChange={handleChange}
                    required
                  />
                  <InputField
                    label="Contraseña"
                    name="contrasena"
                    type="password"
                    value={formData.contrasena}
                    onChange={handleChange}
                    required
                  />
                  <InputField
                    label="Confirmar Contraseña"
                    name="confirmarContrasena"
                    type="password"
                    value={formData.confirmarContrasena}
                    onChange={handleChange}
                    required
                  />
                  <SubmitButton>Siguiente</SubmitButton>
                </>
              )}

              {step === 3 && (
                <>
                  <div className="flex justify-center mb-4">
                    <button
                      type="button"
                      onClick={() => hiddenFileInput.current?.click()}
                      className="w-24 h-24 rounded-full border-2 border-gray-300 bg-gray-100 overflow-hidden flex items-center justify-center"
                      aria-label="Subir imagen de perfil"
                    >
                      <img
                        src={croppedImage || profileImage || userImageDefault}
                        alt="Imagen de perfil"
                        className="w-full h-full object-cover"
                      />
                    </button>
                    <input
                      type="file"
                      ref={hiddenFileInput}
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                      accept="image/*"
                    />
                  </div>

                  <InputField
                    label="Teléfono"
                    name="telefono"
                    type="tel"
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="+56 9 XXXX XXXX"
                    required
                  />
                  <InputField
                    label="Dirección"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                  />

                  <SubmitButton disabled={isLoading}>
                    {isLoading ? 'Registrando...' : 'Registrar'}
                  </SubmitButton>
                </>
              )}
            </motion.form>

            {showCropper && profileImage && (
              <motion.div
                className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                role="dialog"
                aria-modal="true"
              >
                <div className="bg-white p-4 rounded-lg w-80">
                  <h2 className="text-center font-bold mb-4">Recortar Imagen</h2>
                  <div style={{ width: '100%', height: '300px', position: 'relative' }}>
                    <Cropper
                      image={profileImage}
                      crop={crop}
                      zoom={zoom}
                      aspect={1}
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onCropComplete={(_, pixels) => setCropArea(pixels)}
                    />
                  </div>
                  <div className="flex justify-center mt-4 space-x-2">
                    <button
                      type="button"
                      onClick={handleSaveCroppedImage}
                      className="bg-sgreen hover:bg-bgreen text-white py-2 px-4 rounded-2xl"
                    >
                      Guardar
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCropper(false)}
                      className="bg-white border border-sgreen text-sgreen py-2 px-4 rounded-2xl"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Register;