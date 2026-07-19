import { z } from 'zod';

export const FaqItemSchema = z.object({
  id: z.number(),
  pregunta: z.string(),
  respuesta: z.string(),
});

export const FaqListSchema = z.array(FaqItemSchema);

export const ProductoSchema = z.object({
  producto_id: z.number(),
  nombre_producto: z.string(),
  descripcion_producto: z.string(),
  precio_producto: z.number(),
  stock: z.number(),
  imagen_producto: z.string().optional(),
});

export const ProductoListSchema = z.array(ProductoSchema);

export const ProductoPayloadSchema = z.object({
  nombre_producto: z.string().min(1),
  descripcion_producto: z.string().min(1),
  precio_producto: z.number().positive(),
  stock: z.number().int().nonnegative(),
});

export const ArticuloSeccionSchema = z.object({
  seccion_id: z.number(),
  subtitulo: z.string(),
  contenido: z.string(),
});

export const BlogArticuloSchema = z.object({
  publicacion_id: z.number(),
  titulo: z.string(),
  contenido: z.string(),
  fecha_publicacion: z.string(),
  secciones: z.array(ArticuloSeccionSchema).optional(),
});

export const BlogArticuloListSchema = z.array(BlogArticuloSchema);

export const BlogArticuloPayloadSchema = z.object({
  titulo: z.string().min(1),
  contenido: z.string().min(1),
  fecha_publicacion: z.string().optional(),
  secciones: z
    .array(z.object({ subtitulo: z.string().min(1), contenido: z.string().min(1) }))
    .optional(),
});

export const EventoSchema = z.object({
  evento_id: z.number(),
  nombre: z.string(),
  descripcion: z.string(),
  fecha_inicio: z.string(),
  fecha_fin: z.string(),
  ubicacion: z.string(),
  capacidad: z.number(),
  inscritos: z.number(),
});

export const EventoListSchema = z.array(EventoSchema);

export const EventoPayloadSchema = z.object({
  nombre: z.string().min(1),
  descripcion: z.string().min(1),
  fecha_inicio: z.string().min(1),
  fecha_fin: z.string().min(1),
  ubicacion: z.string().min(1),
  capacidad: z.number().int().positive(),
});

export const InscripcionEstadoSchema = z.object({
  inscrito: z.boolean(),
});