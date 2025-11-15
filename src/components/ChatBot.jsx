import React, { useState, useEffect, useRef } from 'react';
import { enviarMensaje } from '../services/chatService';

const ChatBot = () => {
  const [mensajes, setMensajes] = useState([]);
  const [inputMensaje, setInputMensaje] = useState('');
  const [cargando, setCargando] = useState(false);
  const [chatAbierto, setChatAbierto] = useState(false);
  const mensajesEndRef = useRef(null);

  // Mensaje de bienvenida al abrir el chat
  useEffect(() => {
    if (chatAbierto && mensajes.length === 0) {
      setMensajes([
        {
          tipo: 'bot',
          contenido:
            '¡Hola! Soy tu asistente virtual de Omega Joyería. ¿En qué puedo ayudarte hoy? Puedo mostrarte productos, responder sobre horarios, envíos y más.',
          timestamp: new Date(),
        },
      ]);
    }
  }, [chatAbierto, mensajes.length]);

  // Scroll automático al último mensaje
  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const handleEnviar = async (e) => {
    e.preventDefault();

    if (!inputMensaje.trim()) return;

    const mensajeUsuario = inputMensaje.trim();
    setInputMensaje('');

    // Agregar mensaje del usuario
    const nuevoMensajeUsuario = {
      tipo: 'usuario',
      contenido: mensajeUsuario,
      timestamp: new Date(),
    };
    setMensajes((prev) => [...prev, nuevoMensajeUsuario]);

    // Mostrar indicador de carga
    setCargando(true);

    try {
      const respuesta = await enviarMensaje(mensajeUsuario);

      // Agregar respuesta del bot
      const mensajeBot = {
        tipo: 'bot',
        contenido: respuesta.respuesta,
        productos: respuesta.productos || null,
        timestamp: new Date(),
      };
      setMensajes((prev) => [...prev, mensajeBot]);
    } catch (error) {
      // Agregar mensaje de error
      const mensajeError = {
        tipo: 'bot',
        contenido:
          'Lo siento, ocurrió un error al procesar tu mensaje. Por favor, intenta nuevamente.',
        error: true,
        timestamp: new Date(),
      };
      setMensajes((prev) => [...prev, mensajeError]);
    } finally {
      setCargando(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEnviar(e);
    }
  };

  return (
    <>
      {/* Botón flotante para abrir/cerrar chat */}
      <button
        onClick={() => setChatAbierto(!chatAbierto)}
  className="fixed bottom-6 right-6 bg-[#9b4651] hover:bg-[#7f2f42] text-white rounded-full p-4 shadow-lg z-50 transition-transform hover:scale-110"
        aria-label="Abrir chat"
      >
        {chatAbierto ? (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        )}
      </button>

      {/* Ventana de chat */}
      {chatAbierto && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#9b4651] to-[#7f2f42] text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <h3 className="font-semibold">Asistente Omega</h3>
            </div>
            <button
              onClick={() => setChatAbierto(false)}
              className="hover:bg-[#9b4651] p-1 rounded transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {mensajes.map((mensaje, index) => (
              <div
                key={index}
                className={`flex ${
                  mensaje.tipo === 'usuario' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    mensaje.tipo === 'usuario'
                      ? 'bg-[#9b4651] text-white'
                      : mensaje.error
                      ? 'bg-red-100 text-red-800'
                      : 'bg-white text-gray-800 shadow-md'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">
                    {mensaje.contenido}
                  </p>

                  {/* Mostrar productos si los hay */}
                  {mensaje.productos && mensaje.productos.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {mensaje.productos.map((producto, idx) => (
                        <div
                          key={idx}
                          className="bg-gray-50 rounded p-2 border border-gray-200"
                        >
                          <p className="font-semibold text-[#9b4651]">
                            {producto.nombre_producto}
                          </p>
                          <p className="text-xs text-gray-600">
                            {producto.descripcion_producto}
                          </p>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-sm font-bold text-[#9b4651]">
                              $
                              {Number(
                                producto.precio_producto
                              ).toLocaleString('es-CL')}
                            </span>
                            <span className="text-xs text-gray-500">
                              Stock: {producto.stock}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-xs opacity-70 mt-1">
                    {mensaje.timestamp.toLocaleTimeString('es-CL', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}

            {/* Indicador de escritura */}
            {cargando && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 shadow-md rounded-lg p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.1s' }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={mensajesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleEnviar}
            className="p-4 bg-white border-t border-gray-200 rounded-b-lg"
          >
            <div className="flex gap-2">
                <input
                type="text"
                value={inputMensaje}
                onChange={(e) => setInputMensaje(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu mensaje..."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#9b4651] focus:border-transparent"
                disabled={cargando}
              />
              <button
                type="submit"
                disabled={cargando || !inputMensaje.trim()}
                className="bg-[#9b4651] hover:bg-[#7f2f42] disabled:bg-gray-400 text-white rounded-lg px-4 py-2 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatBot;
