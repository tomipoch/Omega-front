import { createContext, useState, useEffect, useContext } from "react";

export const AuthContext = createContext();

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Añadir estado de carga

  useEffect(() => {
    const savedUser = sessionStorage.getItem("user");
    const savedToken = sessionStorage.getItem("token");

    if (savedUser && savedToken) {
      const tokenExpiration = parseInt(
        sessionStorage.getItem("tokenExpiration"),
        10
      );
      const now = new Date().getTime();

      if (now < tokenExpiration) {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      } else {
        logoutUser();
      }
    }
    setIsLoading(false); // Marcar como cargado
  }, []);

  const loginUser = (userData) => {
    if (!userData.usuario_id) {
      console.error("El usuario_id no está presente en la respuesta.");
      return;
    }

    const expirationTime = new Date().getTime() + 3600 * 1000; // 1 hora
    sessionStorage.setItem("user", JSON.stringify(userData));
    sessionStorage.setItem("token", userData.token);
    sessionStorage.setItem("tokenExpiration", expirationTime.toString());
    setUser(userData);
    setToken(userData.token);
  };

  const logoutUser = () => {
    sessionStorage.clear();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};
