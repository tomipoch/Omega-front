import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useUser } from '../../hooks/useUser';
import { useConfirm } from '../../hooks/useConfirm';
import { deleteAccount, getProfile, updateProfile } from '../../services/profileService';
import { ROUTES } from '../../constants/routes';
import { ProfileForm } from '../../features/profile/ProfileForm';
import { ProfilePhotoEditor } from '../../features/profile/ProfilePhotoEditor';
import type { ProfileFormValues } from '../../features/profile/profileFormSchema';
import { QueryBoundary } from '../../components/QueryBoundary';
import userImageDefault from '../../assets/userdefect.png';
import userBackground from '../../assets/user_background.jpg';

const Profile = () => {
  const { user, logoutUser } = useUser();
  const { confirm } = useConfirm();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
    enabled: Boolean(user),
  });

  const updateMutation = useMutation({
    mutationFn: (data: FormData) => updateProfile(data, { isForm: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setMessage('Perfil actualizado correctamente.');
      setCroppedImage(null);
      setCroppedBlob(null);
      setEditing(false);
    },
    onError: (err: Error) => setError(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      logoutUser();
      navigate(ROUTES.HOME);
    },
    onError: (err: Error) => setError(err.message || 'Error al eliminar la cuenta'),
  });

  useEffect(() => {
    if (!user) {
      navigate(ROUTES.LOGIN);
    }
  }, [user, navigate]);

  if (!user) return null;

  const handleSubmit = (values: ProfileFormValues) => {
    setMessage('');
    setError('');
    const fd = new FormData();
    Object.entries(values).forEach(([k, v]) => fd.append(k, v ?? ''));
    if (croppedBlob) fd.append('foto_perfil', croppedBlob, 'profile.jpg');
    updateMutation.mutate(fd);
  };

  const handleDeleteAccount = async () => {
    const ok = await confirm({
      title: 'Eliminar cuenta',
      message: '¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar cuenta',
      variant: 'danger',
    });
    if (!ok) return;
    deleteMutation.mutate();
  };

  return (
    <QueryBoundary
      query={profileQuery}
      loadingMessage="Cargando perfil..."
      empty={() => false}
    >
      {(data) => (
        <div className="max-w-4xl mx-auto my-10 mt-10 p-0 bg-white rounded-2xl overflow-hidden border border-gray-200">
          <div className="relative">
            <img src={userBackground} alt="" decoding="async" className="w-full h-48 object-cover" aria-hidden="true" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white w-40 h-40 bg-gray-200">
              <ProfilePhotoEditor
                currentImage={croppedImage || data.foto_perfil_url || null}
                fallbackImage={userImageDefault}
                onCropped={(url, blob) => {
                  setCroppedImage(url);
                  setCroppedBlob(blob);
                }}
                onError={(msg) => setError(msg)}
              />
            </div>
            {editing && (
              <div className="absolute bottom-[-20px] left-1/2 transform -translate-x-1/2">
                <button
                  type="button"
                  onClick={() => document.querySelector<HTMLInputElement>('input[type=file]')?.click()}
                  className="bg-white border border-sgreen text-sgreen py-1 px-4 rounded-full"
                >
                  Cambiar Imagen
                </button>
              </div>
            )}
          </div>

          <div className="text-center mt-8 text-3xl font-semibold text-green-700">
            {`${data.nombre || ''} ${data.apellido_paterno || ''} ${data.apellido_materno || ''}`.trim() ||
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

          <div className="mt-6 p-6">
            {editing ? (
              <ProfileForm
                initialValues={data}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setEditing(false);
                  setError('');
                  setMessage('');
                  setCroppedImage(null);
                  setCroppedBlob(null);
                }}
                isSubmitting={updateMutation.isPending}
              />
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ReadOnlyField label="Nombre" value={data.nombre} />
                  <ReadOnlyField label="Apellido Paterno" value={data.apellido_paterno ?? ''} />
                  <ReadOnlyField label="Apellido Materno" value={data.apellido_materno ?? ''} />
                  <ReadOnlyField label="Correo Electrónico" value={data.correo_electronico} />
                  <ReadOnlyField label="Teléfono" value={data.telefono ?? ''} />
                  <ReadOnlyField label="Dirección" value={data.direccion ?? ''} />
                </div>
                <div className="mt-8 mb-10 flex justify-center space-x-4">
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="bg-sgreen text-white py-2 px-6 border-2 border-green-500 rounded-2xl shadow-inner-green hover:scale-105 transition"
                  >
                    Editar Perfil
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    disabled={deleteMutation.isPending}
                    className="bg-white border border-sgreen text-sgreen py-2 px-6 rounded-2xl hover:bg-sgreen/15 transition disabled:opacity-60"
                  >
                    {deleteMutation.isPending ? 'Eliminando…' : 'Eliminar Cuenta'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </QueryBoundary>
  );
};

const ReadOnlyField = ({ label, value }: { label: string; value: string }) => (
  <div>
    <label className="block text-gray-600">{label}</label>
    <input
      type="text"
      disabled
      value={value || ''}
      className="w-full p-2 mt-1 border rounded-2xl bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed"
    />
  </div>
);

export default Profile;