import { z } from 'zod';

export const ArticleSectionSchema = z.object({
  subtitulo: z.string().min(1, 'El subtítulo es obligatorio'),
  contenido: z.string().min(1, 'El contenido es obligatorio'),
});

export const ArticleFormSchema = z.object({
  titulo: z.string().min(1, 'El título es obligatorio'),
  contenido: z.string().min(1, 'La introducción es obligatoria'),
  secciones: z.array(ArticleSectionSchema),
});

export type ArticleFormValues = z.infer<typeof ArticleFormSchema>;

export const articleDefaults: ArticleFormValues = {
  titulo: '',
  contenido: '',
  secciones: [],
};