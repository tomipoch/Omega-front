import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Modal from './Modal';

describe('Modal', () => {
  const baseProps = {
    showModal: true,
    toggleModal: vi.fn(),
    onConfirm: vi.fn(),
  };

  it('renders nothing when showModal is false', () => {
    render(<Modal {...baseProps} showModal={false} title="Hidden" />);
    expect(screen.queryByText('Hidden')).toBeNull();
  });

  it('renders title, message, and default button labels when open', () => {
    render(
      <Modal
        {...baseProps}
        title="Eliminar elemento"
        message="¿Confirmas la eliminación?"
      />,
    );
    expect(screen.getByText('Eliminar elemento')).toBeInTheDocument();
    expect(screen.getByText('¿Confirmas la eliminación?')).toBeInTheDocument();
    expect(screen.getByText('Confirmar')).toBeInTheDocument();
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', () => {
    const onConfirm = vi.fn();
    render(<Modal {...baseProps} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByText('Confirmar'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls toggleModal when cancel button is clicked', () => {
    const toggleModal = vi.fn();
    render(<Modal {...baseProps} toggleModal={toggleModal} />);
    fireEvent.click(screen.getByText('Cancelar'));
    expect(toggleModal).toHaveBeenCalledTimes(1);
  });

  it('disables both buttons while loading and shows pending label', () => {
    render(
      <Modal
        {...baseProps}
        loading
        confirmText="Eliminar"
      />,
    );
    expect(screen.getByText('Procesando...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Procesando...' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
  });

  it('closes on Escape key when not loading', () => {
    const toggleModal = vi.fn();
    render(<Modal {...baseProps} toggleModal={toggleModal} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(toggleModal).toHaveBeenCalledTimes(1);
  });

  it('does not close on Escape while loading', () => {
    const toggleModal = vi.fn();
    render(<Modal {...baseProps} toggleModal={toggleModal} loading />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(toggleModal).not.toHaveBeenCalled();
  });
});