import { useEffect } from 'react';

interface ModalProps {
  showModal: boolean;
  toggleModal: () => void;
  onConfirm: () => void;
  loading?: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}

const Modal = ({
  showModal,
  toggleModal,
  onConfirm,
  loading = false,
  title = 'Confirmar acción',
  message = '¿Estás seguro de que deseas realizar esta acción? Esta acción no se puede deshacer.',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
}: ModalProps) => {
  useEffect(() => {
    if (!showModal) return undefined;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) toggleModal();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [showModal, loading, toggleModal]);

  if (!showModal) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white p-6 rounded-2xl shadow-lg max-w-md mx-auto">
        <h2 id="modal-title" className="text-lg font-semibold mb-4">{title}</h2>
        <p className="mb-4">{message}</p>
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={toggleModal}
            className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-2xl hover:bg-gray-200"
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`py-2 px-4 rounded-2xl shadow-md transition ${
              loading
                ? 'bg-white text-sgreen border border-sgreen'
                : 'bg-sgreen text-white border-2 border-green-500 hover:shadow-inner-hgreen'
            }`}
          >
            {loading ? 'Procesando...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;