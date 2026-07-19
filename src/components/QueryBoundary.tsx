import type { UseQueryResult } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { EmptyState } from './EmptyState';

interface QueryBoundaryProps<TData, TError> {
  query: UseQueryResult<TData, TError>;
  children: (data: TData) => ReactNode;
  loadingMessage?: string;
  errorTitle?: string;
  empty?: (data: TData) => boolean;
  emptyState?: ReactNode;
}

export function QueryBoundary<TData, TError>({
  query,
  children,
  loadingMessage = 'Cargando…',
  errorTitle = 'Algo salió mal',
  empty,
  emptyState,
}: QueryBoundaryProps<TData, TError>) {
  if (query.isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <p className="text-gray-600">{loadingMessage}</p>
      </div>
    );
  }

  if (query.error) {
    return (
      <div className="text-center text-red-600 py-6" role="alert">
        <p className="font-semibold mb-1">{errorTitle}</p>
        <p className="text-sm">{String((query.error as { message?: unknown })?.message ?? query.error)}</p>
      </div>
    );
  }

  const data = query.data;

  if (empty?.(data as TData)) {
    return <>{emptyState ?? <EmptyState message="No hay datos disponibles." />}</>;
  }

  return <>{children(data as TData)}</>;
}

export default QueryBoundary;