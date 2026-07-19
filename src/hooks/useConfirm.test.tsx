import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConfirmProvider, useConfirm } from './useConfirm';

const Trigger = ({ onResult }: { onResult: (v: boolean) => void }) => {
  const { confirm } = useConfirm();
  return (
    <button
      type="button"
      onClick={async () => {
        const result = await confirm({ message: '¿Continuar?', confirmText: 'Sí' });
        onResult(result);
      }}
    >
      open
    </button>
  );
};

describe('useConfirm', () => {
  it('throws when used outside ConfirmProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Trigger onResult={() => {}} />)).toThrow(/ConfirmProvider/);
    spy.mockRestore();
  });

  it('resolves true when the user confirms', async () => {
    const onResult = vi.fn();
    render(
      <ConfirmProvider>
        <Trigger onResult={onResult} />
      </ConfirmProvider>,
    );

    fireEvent.click(screen.getByText('open'));
    await waitFor(() => {
      expect(screen.getByText('¿Continuar?')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Sí'));
    await waitFor(() => {
      expect(onResult).toHaveBeenCalledWith(true);
    });
  });

  it('resolves false when the user cancels', async () => {
    const onResult = vi.fn();
    render(
      <ConfirmProvider>
        <Trigger onResult={onResult} />
      </ConfirmProvider>,
    );

    fireEvent.click(screen.getByText('open'));
    await waitFor(() => {
      expect(screen.getByText('¿Continuar?')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Cancelar'));
    await waitFor(() => {
      expect(onResult).toHaveBeenCalledWith(false);
    });
  });
});