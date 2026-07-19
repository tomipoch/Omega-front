import { useEffect, useRef } from 'react';

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

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

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
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const confirmButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const toggleModalRef = useRef(toggleModal);
  toggleModalRef.current = toggleModal;

  useEffect(() => {
    if (!showModal) return undefined;

    previousFocusRef.current = document.activeElement as HTMLElement | null;

    const focusFirst = () => {
      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusables = dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      const target = focusables[0] ?? confirmButtonRef.current;
      target?.focus();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        e.preventDefault();
        toggleModalRef.current();
        return;
      }
      if (e.key !== 'Tab') return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusables = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((el) => !el.hasAttribute('disabled'));
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    focusFirst();

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previousFocusRef.current?.focus?.();
    };
  }, [showModal, loading]);

  const handleBackdropMouseDown = (e: React.MouseEvent) => {
    if (loading) return;
    if (e.target === e.currentTarget) {
      toggleModal();
    }
  };

  if (!showModal) return null;

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- backdrop click closes the dialog; keyboard users have Escape and the close button
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-message"
      onMouseDown={handleBackdropMouseDown}
    >
      <div
        ref={dialogRef}
        className="bg-white p-6 rounded-2xl shadow-lg max-w-md mx-auto"
      >
        <h2 id="modal-title" className="text-lg font-semibold mb-4">{title}</h2>
        <p id="modal-message" className="mb-4">{message}</p>
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
            ref={confirmButtonRef}
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