import { useRef, useState } from 'react';
import Cropper from 'react-easy-crop';
import imageCompression from 'browser-image-compression';
import { getCroppedImg, type CropArea } from '../../utils/cropImage';

interface ProfilePhotoEditorProps {
  currentImage: string | null;
  fallbackImage: string;
  onCropped: (blobUrl: string, blob: Blob) => void;
  onError: (message: string) => void;
}

export const ProfilePhotoEditor = ({
  currentImage,
  fallbackImage,
  onCropped,
  onError,
}: ProfilePhotoEditorProps) => {
  const hiddenFileInput = useRef<HTMLInputElement | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(currentImage);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropArea, setCropArea] = useState<CropArea | null>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1920 });
      const url = URL.createObjectURL(compressed);
      setProfileImage(url);
      setShowCropper(true);
    } catch {
      onError('Error al procesar la imagen.');
    }
  };

  const handleSaveCroppedImage = async () => {
    if (!profileImage || !cropArea) return;
    try {
      const url = await getCroppedImg(profileImage, cropArea);
      const response = await fetch(url);
      const blob = await response.blob();
      onCropped(url, blob);
      setProfileImage(url);
      setShowCropper(false);
    } catch {
      onError('Error al recortar la imagen.');
    }
  };

  return (
    <>
      <img
        src={profileImage || fallbackImage}
        alt="Imagen de perfil"
        className="w-full h-full object-cover rounded-full"
        onClick={() => hiddenFileInput.current?.click()}
      />
      <input
        type="file"
        ref={hiddenFileInput}
        onChange={handleImageChange}
        style={{ display: 'none' }}
        accept="image/*"
      />
      {showCropper && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-96">
            <h2 className="text-center text-xl font-semibold text-gray-700 mb-4">
              Recortar Imagen
            </h2>
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
    </>
  );
};

export default ProfilePhotoEditor;