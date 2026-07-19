import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Modal from './Modal';

describe('Modal accessibility', () => {
  let activeElement: HTMLElement | null = null;

  beforeEach(() => {
    activeElement = document.createElement('button');
    activeElement.textContent = 'trigger';
    document.body.appendChild(activeElement);
    activeElement.focus();
  });

  afterEach(() => {
    document.body.removeChild(activeElement as HTMLElement);
  });

  it('moves focus to the first focusable element when opened', async () => {
    render(
      <Modal
        showModal
        toggleModal={vi.fn()}
        onConfirm={vi.fn()}
        title="Título"
        message="Mensaje"
        confirmText="Confirmar"
        cancelText="Cancelar"
      />,
    );

    await waitFor(() => {
      expect(document.activeElement?.textContent).toBe('Cancelar');
    });
  });

  it('returns focus to the trigger element when closed', async () => {
    const toggleModal = vi.fn();
    const { rerender } = render(
      <Modal
        showModal
        toggleModal={toggleModal}
        onConfirm={vi.fn()}
        title="Título"
        message="Mensaje"
      />,
    );

    await waitFor(() => expect(document.activeElement).not.toBe(activeElement));

    rerender(
      <Modal
        showModal={false}
        toggleModal={toggleModal}
        onConfirm={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(document.activeElement).toBe(activeElement);
    });
  });

  it('closes on Escape when not loading', () => {
    const toggleModal = vi.fn();
    render(<Modal showModal toggleModal={toggleModal} onConfirm={vi.fn()} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(toggleModal).toHaveBeenCalledTimes(1);
  });

  it('does not close on Escape while loading', () => {
    const toggleModal = vi.fn();
    render(
      <Modal showModal toggleModal={toggleModal} onConfirm={vi.fn()} loading />,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(toggleModal).not.toHaveBeenCalled();
  });

  it('traps Tab focus inside the dialog', async () => {
    render(<Modal showModal toggleModal={vi.fn()} onConfirm={vi.fn()} />);

    await waitFor(() => expect(document.activeElement?.textContent).toBe('Cancelar'));

    const confirm = screen.getByText('Confirmar');
    confirm.focus();
    fireEvent.keyDown(document, { key: 'Tab' });

    await waitFor(() => {
      expect(document.activeElement?.textContent).toBe('Cancelar');
    });
  });

  it('wraps focus on Shift+Tab from the first element', async () => {
    render(<Modal showModal toggleModal={vi.fn()} onConfirm={vi.fn()} />);

    await waitFor(() => expect(document.activeElement?.textContent).toBe('Cancelar'));

    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });

    await waitFor(() => {
      expect(document.activeElement?.textContent).toBe('Confirmar');
    });
  });

  it('marks the dialog as modal and labelled', () => {
    render(
      <Modal
        showModal
        toggleModal={vi.fn()}
        onConfirm={vi.fn()}
        title="Mi título"
        message="Mi mensaje"
      />,
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
    expect(dialog).toHaveAttribute('aria-describedby', 'modal-message');
    expect(screen.getByText('Mi título')).toHaveAttribute('id', 'modal-title');
    expect(screen.getByText('Mi mensaje')).toHaveAttribute('id', 'modal-message');
  });
});