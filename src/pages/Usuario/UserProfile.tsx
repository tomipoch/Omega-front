import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Cropper from 'react-easy-crop';
import imageCompression from 'browser-image-compression';
import { useUser } from '../../hooks/useUser';
import { getProfile, updateProfile, deleteAccount } from '../../services/authService';
import { getCroppedImg, type CropArea } from '../../utils/cropImage';
import Modal from '../../components/Modal';
import userImageDefault from '../../assets/userdefect.png';
import userBackground from '../../assets/user_background.jpg';

interface ProfileData {
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  correo_electronico: string;
  telefono: string;
  direccion: string;
}

const requiredFieldsFilled = (data: ProfileData): boolean =>
  Boolean(data.nombre?.trim()) &&
  Boolean(data.apellido_paterno?.trim()) &&
  Boolean(data.correo_electronico?.trim());

const ProfileField = ({
  label,
  name,
  value,
  editing,
  onChange,
  required = false,
  type = 'text',
  disabledMessage,
}: {
  label: string;
  name: string;
  value: string;
  editing: boolean;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
  disabledMessage?: string;
}) => (
  <div>
    <label htmlFor={name} className="block text-gray-600">
      {label}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      value={value || ''}
      disabled={!editing}
      required={required && editing}
      onChange={(e) => onChange(e.target.value)}
      title={disabledMessage}
      className={`w-full p-2 mt-1 border rounded-2xl transition-all duration-300 ${
        editing && !disabledMessage
          ? 'border-sgreen bg-white scale-105 shadow-md'
          : 'border-gray-300 bg-gray-100 scale-100'
      }`}
    />
  </div>
);

const UserProfile = () => {
  const { user, logoutUser } = useUser();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileData>({
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    correo_electronico: '',
    telefono: '',
    direccion: '',
  });
  const [originalData, setOriginalData] = useState<ProfileData>(formData);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropArea, setCropArea] = useState<CropArea | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const hiddenFileInput = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return undefined;
    }
    let cancelled = false;

    const fetchProfileData = async () => {
      try {
        const data = await getProfile();
        if (cancelled) return;
        const next: ProfileData = {
          nombre: data.nombre || '',
          apellido_paterno: data.apellido_paterno || '',
          apellido_materno: data.apellido_materno || '',
          correo_electronico: data.correo_electronico || '',
          telefono: data.telefono || '',
          direccion: data.direccion || '',
        };
        setFormData(next);
        setOriginalData(next);
        setProfileImage(data.foto_perfil_url || userImageDefault);
      } catch (err) {
        if (!cancelled) setError((err as Error).message || 'Error al cargar el perfil.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProfileData();
    return () => {
      cancelled = true;
    };
  }, [user, navigate]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1920 });
      setProfileImage(URL.createObjectURL(compressed));
      setShowCropper(true);
    } catch {
      setError('Error al procesar la imagen.');
    }
  };

  const handleImageClick = () => {
    if (isEditing) hiddenFileInput.current?.click();
  };

  const handleSaveCroppedImage = async () => {
    if (!profileImage || !cropArea) return;
    try {
      const url = await getCroppedImg(profileImage, cropArea);
      setCroppedImage(url);
      setProfileImage(url);
      setShowCropper(false);
    } catch {
      setError('Error al recortar la imagen.');
    }
  };

  const handleSaveProfile = async () => {
    setMessage('');
    setError('');

    if (!requiredFieldsFilled(formData)) {
      setError('Los campos Nombre, Apellido Paterno y Correo Electrónico son obligatorios.');
      return;
    }

    const sinCambios = (Object.keys(formData) as Array<keyof ProfileData>).every(
      (k) => formData[k] === originalData[k],
    );

    if (sinCambios && !croppedImage) {
      setMessage('No se realizaron cambios.');
      setIsEditing(false);
      return;
    }

    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => fd.append(k, v ?? ''));

      if (croppedImage) {
        const response = await fetch(croppedImage);
        const blob = await response.blob();
        fd.append('foto_perfil', blob, 'profile.jpg');
      }

      await updateProfile(fd, { isForm: true });
      setMessage('Perfil actualizado correctamente.');
      setOriginalData(formData);
      setCroppedImage(null);
      setIsEditing(false);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      logoutUser();
      navigate('/');
    } catch (err) {
      setError((err as Error).message || 'Error al eliminar la cuenta');
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleModal = () => setShowModal((v) => !v);

  const handleCancelEdit = () => {
    setFormData(originalData);
    setCroppedImage(null);
    setError('');
    setMessage('');
    setIsEditing(false);
  };

  if (loading) {
    return <div className="text-center mt-10">Cargando perfil...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto my-10 mt-10 p-0 bg-white rounded-2xl overflow-hidden border border-gray-200">
      <div className="relative">
        <img src={userBackground} alt="" className="w-full h-48 object-cover" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white w-40 h-40 bg-gray-200">
          <img
            src={croppedImage || profileImage || userImageDefault}
            alt="Imagen de perfil"
            className="w-full h-full object-cover rounded-full"
            onClick={handleImageClick}
          />
          <input
            type="file"
            ref={hiddenFileInput}
            onChange={handleImageChange}
            style={{ display: 'none' }}
            accept="image/*"
          />
        </div>
        {isEditing && (
          <div className="absolute bottom-[-20px] left-1/2 transform -translate-x-1/2">
            <button
              type="button"
              onClick={handleImageClick}
              className="bg-white border border-sgreen text-sgreen py-1 px-4 rounded-full"
            >
              Cambiar Imagen
            </button>
          </div>
        )}
      </div>

      <div className="text-center mt-8 text-3xl font-semibold text-green-700">
        {`${formData.nombre || ''} ${formData.apellido_paterno || ''} ${formData.apellido_materno || ''}`.trim() ||
          'Usuario'}
      </div>

      {(message || error) && (
        <div
          className={`mx-6 mt-4 p-3 rounded ${
            error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}
          role="status"
        >
          {error || message}
        </div>
      )}

      <div className="mt-6 p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProfileField
          label="Nombre"
          name="nombre"
          value={formData.nombre}
          editing={isEditing}
          onChange={(v) => setFormData((prev) => ({ ...prev, nombre: v }))}
          required
        />
        <ProfileField
          label="Apellido Paterno"
          name="apellido_paterno"
          value={formData.apellido_paterno}
          editing={isEditing}
          onChange={(v) => setFormData((prev) => ({ ...prev, apellido_paterno: v }))}
          required
        />
        <ProfileField
          label="Apellido Materno"
          name="apellido_materno"
          value={formData.apellido_materno}
          editing={isEditing}
          onChange={(v) => setFormData((prev) => ({ ...prev, apellido_materno: v }))}
        />
        <ProfileField
          label="Correo Electrónico"
          name="correo_electronico"
          value={formData.correo_electronico}
          editing={false}
          type="email"
          onChange={() => {}}
          required
          disabledMessage="El correo no se puede editar"
        />
        <ProfileField
          label="Teléfono"
          name="telefono"
          value={formData.telefono}
          editing={isEditing}
          onChange={(v) => setFormData((prev) => ({ ...prev, telefono: v }))}
        />
        <ProfileField
          label="Dirección"
          name="direccion"
          value={formData.direccion}
          editing={isEditing}
          onChange={(v) => setFormData((prev) => ({ ...prev, direccion: v }))}
        />
      </div>

      <div className="mt-8 mb-10 flex justify-center space-x-4">
        {isEditing ? (
          <>
            <button
              type="button"
              onClick={handleSaveProfile}
              className="bg-sgreen text-white py-2 px-6 border-2 border-green-500 rounded-2xl shadow-inner-green hover:scale-105 transition"
            >
              Guardar Cambios
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="bg-white border border-sgreen text-sgreen py-2 px-6 rounded-2xl hover:bg-sgreen/15 transition"
            >
              Cancelar
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="bg-sgreen text-white py-2 px-6 border-2 border-green-500 rounded-2xl shadow-inner-green hover:scale-105 transition"
            >
              Editar Perfil
            </button>
            <button
              type="button"
              onClick={toggleModal}
              className="bg-white border border-sgreen text-sgreen py-2 px-6 rounded-2xl hover:bg-sgreen/15 transition"
            >
              Eliminar Cuenta
            </button>
          </>
        )}
      </div>

      <Modal
        showModal={showModal}
        toggleModal={toggleModal}
        onConfirm={handleDeleteAccount}
        loading={isDeleting}
        title="Eliminar cuenta"
        message="¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer."
        confirmText={isDeleting ? 'Procesando...' : 'Eliminar cuenta'}
      />

      {showCropper && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-96">
            <h2 className="text-center text-xl font-semibold text-gray-700 mb-4">Recortar Imagen</h2>
            <div className="relative w-full h-80 bg-gray-200">
              {profileImage && (
                <Cropper
                  image={profileImage}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={(_, pixels) => setCropArea(pixels)}
                />
              )}
            </div>
            <div className="mt-4 flex justify-center space-x-4">
              <button
                type="button"
                onClick={handleSaveCroppedImage}
                className="bg-sgreen text-white py-2 px-4 rounded-2xl hover:bg-bgreen"
              >
                Guardar Imagen
              </button>
              <button
                type="button"
                onClick={() => setShowCropper(false)}
                className="bg-white border border-sgreen text-sgreen py-2 px-6 rounded-2xl hover:bg-sgreen/15 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;