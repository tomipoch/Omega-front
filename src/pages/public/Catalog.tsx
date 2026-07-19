import { useQuery } from '@tanstack/react-query';
import { getProducts } from '../../services/productsService';
import { API_URL } from '../../services/apiClient';
import type { Producto } from '../../types';

const Catalog = () => {
  const { data, isLoading, error } = useQuery<Producto[]>({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p className="text-gray-600">Cargando catálogo…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 py-8" role="alert">
        <p>{(error as Error).message}</p>
      </div>
    );
  }

  const productos = data ?? [];

  return (
    <section className="py-12 bg-white font-ibm">
      <div className="container mx-auto px-6 md:px-12 lg:px-48">
        <h1 className="text-3xl font-semibold text-gray-800 text-center mb-8">Catálogo</h1>
        {productos.length === 0 ? (
          <p className="text-center text-gray-500">No hay productos disponibles.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {productos.map((producto) => (
              <article
                key={producto.producto_id}
                className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              >
                {producto.imagen_producto && (
                  <img
                    src={`${API_URL}/${String(producto.imagen_producto).replace(/\\/g, '/')}`}
                    alt={producto.nombre_producto}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-48 object-cover rounded-xl mb-4"
                  />
                )}
                <h2 className="text-lg font-medium text-gray-800">{producto.nombre_producto}</h2>
                <p className="text-gray-600 text-sm mt-2 line-clamp-3">
                  {producto.descripcion_producto}
                </p>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-lg font-bold text-green-600">
                    ${producto.precio_producto}
                  </span>
                  <span className="text-xs text-gray-500">Stock: {producto.stock}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Catalog;