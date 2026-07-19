import type { ReactNode } from 'react';

interface EmptyStateProps {
  title?: string;
  message: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export const EmptyState = ({ title, message, action, icon }: EmptyStateProps) => (
  <div className="text-center py-10 text-gray-500" role="status">
    {icon && <div className="mb-3 flex justify-center text-gray-300">{icon}</div>}
    {title && <p className="text-lg font-medium text-gray-600 mb-1">{title}</p>}
    <p>{message}</p>
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export default EmptyState;