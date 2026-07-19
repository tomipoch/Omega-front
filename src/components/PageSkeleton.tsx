const PageSkeleton = () => (
  <div
    className="flex flex-col items-center justify-center py-20 px-4"
    role="status"
    aria-live="polite"
    aria-label="Cargando contenido"
  >
    <div className="h-10 w-10 border-4 border-sgreen border-t-transparent rounded-full animate-spin" />
    <p className="mt-4 text-gray-600">Cargando…</p>
  </div>
);

export default PageSkeleton;