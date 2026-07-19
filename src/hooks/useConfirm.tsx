import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import Modal from '../components/Modal';

export type ConfirmVariant = 'default' | 'danger';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
}

interface ConfirmState extends ConfirmOptions {
  isOpen: boolean;
  resolver: ((value: boolean) => void) | null;
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

const INITIAL_STATE: ConfirmState = {
  isOpen: false,
  resolver: null,
  message: '',
};

export const ConfirmProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<ConfirmState>(INITIAL_STATE);
  const [loading, setLoading] = useState(false);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setState({ ...options, isOpen: true, resolver: resolve });
    });
  }, []);

  const close = useCallback(
    (result: boolean) => {
      state.resolver?.(result);
      setState(INITIAL_STATE);
      setLoading(false);
    },
    [state],
  );

  const handleConfirm = useCallback(() => {
    close(true);
  }, [close]);

  const handleCancel = useCallback(() => {
    close(false);
  }, [close]);

  const value = useMemo<ConfirmContextValue>(() => ({ confirm }), [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <Modal
        showModal={state.isOpen}
        toggleModal={handleCancel}
        onConfirm={handleConfirm}
        loading={loading}
        title={state.title ?? 'Confirmar acción'}
        message={state.message}
        confirmText={state.confirmText ?? 'Confirmar'}
        cancelText={state.cancelText ?? 'Cancelar'}
      />
    </ConfirmContext.Provider>
  );
};

export const useConfirm = (): ConfirmContextValue => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error(
      'useConfirm debe usarse dentro de <ConfirmProvider>. Envuelve la app con <ConfirmProvider>.',
    );
  }
  return ctx;
};