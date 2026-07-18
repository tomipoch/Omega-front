import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../services/authContext';
import NavigationLinks from './NavigationLinks';
import UserMenu from './UserMenu';
import MobileMenu from './MobileMenu';
import { FaBars } from 'react-icons/fa';

const HIDE_CHROME_ROUTES = new Set(['/login', '/register', '/forgot-password', '/reset-password']);

const Header = () => {
  const context = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen((v) => !v);

  const handleLogout = () => {
    context?.logoutUser();
    navigate('/');
  };

  return (
    <header className="bg-white/70 backdrop-blur-lg font-ibm fixed top-0 left-0 w-full z-50 h-20">
      <div className="container mx-auto flex justify-between items-center h-full px-4">
        <div className="w-1/3 flex justify-start">
          <Link to="/" aria-label="Inicio">
            <img src="/vite.svg" alt="Logo" className="w-32 h-auto" />
          </Link>
        </div>

        <nav className="hidden md:flex w-1/3 justify-center" aria-label="Navegación principal">
          <div className="bg-transparent backdrop-blur-md border border-sgreen/15 rounded-full px-6 py-2 flex items-center justify-center space-x-6">
            <NavigationLinks />
          </div>
        </nav>

        <div className="flex items-center space-x-4 ml-auto">
          <div className="hidden md:flex">
            {context?.user ? (
              <UserMenu user={context.user} handleLogout={handleLogout} />
            ) : (
              !HIDE_CHROME_ROUTES.has(window.location.pathname) && (
                <>
                  <Link
                    to="/login"
                    className="text-gray-700 py-2 px-2 rounded-2xl hover:border-sgreen hover:text-sgreen transition"
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    to="/register"
                    className="bg-sgreen text-white py-2 px-4 border-2 border-green-500 rounded-2xl shadow-inner-green hover:shadow-inner-hgreen transition duration-300 ease-in-out"
                  >
                    Registrarse
                  </Link>
                </>
              )
            )}
          </div>

          <button
            type="button"
            onClick={toggleMobileMenu}
            className="md:hidden text-gray-700"
            aria-label="Abrir menú"
            aria-expanded={isMobileMenuOpen}
          >
            <FaBars size={24} />
          </button>
        </div>
      </div>

      <MobileMenu
        isMobileMenuOpen={isMobileMenuOpen}
        toggleMobileMenu={toggleMobileMenu}
      />
    </header>
  );
};

export default Header;