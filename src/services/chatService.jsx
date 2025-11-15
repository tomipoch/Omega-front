const API_URL = 'http://localhost:4000';

/**
 * Envía un mensaje al chatbot y obtiene la respuesta
 * @param {string} mensaje - Mensaje del usuario
 * @returns {Promise<Object>} - Respuesta del bot con { respuesta, productos?, tipo }
 */
export const enviarMensaje = async (mensaje) => {
  try {
    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mensajeUsuario: mensaje }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al enviar mensaje');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en servicio de chat:', error);
    throw error;
  }
};
