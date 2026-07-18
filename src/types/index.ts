// Domain types for the Omega frontend.
// Backend shapes are inferred from existing usage; tighten in a later pass once
// the API stabilises.

export const USER_ROL = 1 as const;
export const ADMIN_ROL = 2 as const;
export type Rol = typeof USER_ROL | typeof ADMIN_ROL;

export interface AuthUser {
  usuario_id: number;
  nombre: string;
  token: string;
  foto_perfil_url?: string | null;
  rol_id: Rol;
}

export interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  loginUser: (user: AuthUser) => void;
  logoutUser: () => void;
  updateUser: (partial: Partial<AuthUser>) => void;
}

export interface Cita {
  cita_id: number;
  usuario_id: number;
  usuario_nombre?: string;
  usuario_apellido?: string;
  usuario_email?: string;
  servicio_id: number;
  servicio_nombre?: string;
  servicio_precio?: number;
  disponibilidad_id: number;
  fecha: string; // 'YYYY-MM-DD'
  hora_inicio: string; // 'HH:mm:ss'
  hora_fin: string;
  notas?: string;
  estado_id?: number;
  estado_nombre?: string;
}

export type DisponibilidadEstado = 'disponible' | 'ocupada' | 'cancelada';

export interface Disponibilidad {
  disponibilidad_id: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: DisponibilidadEstado;
  admin_id?: number;
  admin_nombre?: string;
  admin_apellido?: string;
  cita_id?: number;
  cliente_nombre?: string;
  cliente_apellido?: string;
  cliente_email?: string;
  servicio_nombre?: string;
  servicio_precio?: number;
  cita_notas?: string;
  es_actual?: boolean;
}

export interface Servicio {
  servicio_id: number;
  nombre_servicio: string;
  descripcion?: string;
  precio: number;
  duracion_estimada?: number | null;
}

export type EstadoTestimonio = 'Pendiente' | 'Confirmado' | 'Cancelado';

export interface Testimonio {
  testimonio_id: number;
  usuario_id: number;
  nombre?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  contenido: string;
  estrellas: number;
  fecha_creacion: string;
  nombre_estado?: EstadoTestimonio;
}

export interface ArticuloSeccion {
  seccion_id: number;
  subtitulo: string;
  contenido: string;
}

export interface BlogArticulo {
  publicacion_id: number;
  titulo: string;
  contenido: string;
  fecha_publicacion: string;
  secciones?: ArticuloSeccion[];
}

export interface Producto {
  producto_id: number;
  nombre_producto: string;
  descripcion_producto: string;
  precio_producto: number;
  stock: number;
  imagen_producto?: string;
}

export interface Evento {
  evento_id: number;
  nombre: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
  ubicacion: string;
  capacidad: number;
  inscritos: number;
}

export interface InscripcionEstado {
  inscrito: boolean;
}

export interface FaqItem {
  id: number;
  pregunta: string;
  respuesta: string;
}

export interface ApiError extends Error {
  status: number;
  data: unknown;
}

export interface PaginatedResponse<T> {
  articles?: T[];
  totalPages?: number;
}

export type ApiList<T> = T[] | { data: T[] } | { results: T[] };

// Auth payloads

export interface LoginCredentials {
  correo_electronico: string;
  contrasena: string;
}

export interface RegisterPayload {
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  correo_electronico: string;
  contrasena: string;
  telefono?: string;
  direccion?: string;
}

export interface ResetPasswordRequest {
  correo_electronico: string;
}

export interface ResetPasswordConfirm {
  correo_electronico: string;
  codigo: string;
  nuevaContrasena: string;
}

export interface ProfileUpdatePayload {
  nombre?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  telefono?: string;
  direccion?: string;
}

// Disponibilidad payload (snake_case sent to backend)

export interface DisponibilidadPayload {
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: DisponibilidadEstado;
}

// Cita payloads

export interface CitaFormData {
  usuario_id?: number | '';
  disponibilidad_id: number;
  servicio_id: number;
  notas?: string;
}

// Solicitud de personalización

export interface SolicitudPersonalizacionPayload {
  usuario_id: number;
  servicio_id: number;
  detalles: string;
}

// Producto payloads

export interface ProductoPayload {
  nombre_producto: string;
  descripcion_producto: string;
  precio_producto: number;
  stock: number;
}

// Evento payloads

export interface EventoPayload {
  nombre: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
  ubicacion: string;
  capacidad: number;
}