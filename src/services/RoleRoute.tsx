import { type ReactNode } from 'react';
import ProtectedRoute from './ProtectedRoute';
import { ADMIN_ROL } from '../types';
import type { Rol } from '../types';

interface RoleRouteProps {
  allowedRoles: Rol[];
  children: ReactNode;
}

export const RoleRoute = ({ allowedRoles, children }: RoleRouteProps) => (
  <ProtectedRoute allowedRoles={allowedRoles}>{children}</ProtectedRoute>
);

interface AdminRouteProps {
  children: ReactNode;
  allowedRoles?: Rol[];
}

export const AdminRoute = ({ children, allowedRoles = [ADMIN_ROL] }: AdminRouteProps) => (
  <RoleRoute allowedRoles={allowedRoles}>{children}</RoleRoute>
);