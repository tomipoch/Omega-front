import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import { HIDE_CHROME_ROUTES, ROUTES } from '../constants/routes';
import NavigationLinks from './NavigationLinks';
import UserMenu from './UserMenu';
import MobileMenu from './MobileMenu';
import { FaBars } from 'react-icons/fa';
import { ICON_SIZES } from './icons';
import { useLocation } from 'react-router-dom';

const Header = () => {
  const { user, logoutUser } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen((v) => !v);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = () => {
    logoutUser();
    navigate(ROUTES.HOME);
  };

  const hideAuthLinks = HIDE_CHROME_ROUTES.has(location.pathname);

  return (
    <header className="bg-white/70 backdrop-blur-lg font-ibm fixed top-0 left-0 w-full z-50 h-20">
      <div className="container mx-auto flex justify-between items-center h-full px-4">
        <div className="w-1/3 flex justify-start">
          <Link to={ROUTES.HOME} aria-label="Inicio">
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
            {user ? (
              <UserMenu user={user} handleLogout={handleLogout} />
            ) : (
              !hideAuthLinks && (
                <>
                  <Link
                    to={ROUTES.LOGIN}
                    className="text-gray-700 py-2 px-2 rounded-2xl hover:border-sgreen hover:text-sgreen transition"
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    to={ROUTES.REGISTER}
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
            <FaBars size={ICON_SIZES.md} />
          </button>
        </div>
      </div>

      <MobileMenu
        isMobileMenuOpen={isMobileMenuOpen}
        closeMobileMenu={closeMobileMenu}
      />
    </header>
  );
};

export default Header;