import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaAngleDown } from 'react-icons/fa';
import { ROUTES } from '../constants/routes';

interface MobileMenuProps {
  isMobileMenuOpen: boolean;
  closeMobileMenu: () => void;
}

const MobileMenu = ({ isMobileMenuOpen, closeMobileMenu }: MobileMenuProps) => {
  const [isServiciosOpen, setIsServiciosOpen] = useState(false);
  const [isOtrosOpen, setIsOtrosOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const handleClose = useCallback(() => {
    setIsServiciosOpen(false);
    setIsOtrosOpen(false);
    closeMobileMenu();
  }, [closeMobileMenu]);

  const toggleDropdown = (dropdown: 'servicios' | 'otros') => {
    if (dropdown === 'servicios') {
      setIsServiciosOpen((prev) => !prev);
      setIsOtrosOpen(false);
    } else {
      setIsOtrosOpen((prev) => !prev);
      setIsServiciosOpen(false);
    }
  };

  useEffect(() => {
    if (!isMobileMenuOpen) return undefined;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMobileMenuOpen, handleClose]);

  if (!isMobileMenuOpen) return null;

  return (
    <div
      ref={menuRef}
      className="md:hidden absolute top-16 left-0 right-0 bg-white z-20 shadow-lg rounded-b-2xl font-playfair"
      role="dialog"
      aria-modal="true"
      aria-label="Menú móvil"
    >
      <nav className="flex flex-col space-y-2 py-4 text-center border-b-2 border-gray-200">
        <Link to={ROUTES.HOME} className="text-sgreen hover:bg-gray-200 py-2 rounded transition" onClick={handleClose}>
          Inicio
        </Link>
        <Link to={ROUTES.APPOINTMENTS} className="text-sgreen hover:bg-gray-200 py-2 rounded transition" onClick={handleClose}>
          Citas
        </Link>

        <div className="relative">
          <button
            type="button"
            onClick={() => toggleDropdown('servicios')}
            aria-expanded={isServiciosOpen}
            aria-controls="mobile-servicios-menu"
            className="flex justify-center items-center space-x-1 text-sgreen w-full py-2 hover:bg-gray-200 transition"
          >
            <span>Servicios</span>
            <FaAngleDown className={`${isServiciosOpen ? 'rotate-180' : ''} transition-transform`} />
          </button>
          {isServiciosOpen && (
            <ul id="mobile-servicios-menu" className="flex flex-col bg-gray-100 border-t border-gray-300 space-y-1">
              <li>
                <Link to={ROUTES.CUSTOM_REQUEST} className="text-sgreen py-2 px-4 hover:bg-gray-200 transition" onClick={handleClose}>
                  Personalización
                </Link>
              </li>
              <li>
                <Link to={ROUTES.EVENTS} className="text-sgreen py-2 px-4 hover:bg-gray-200 transition" onClick={handleClose}>
                  Eventos
                </Link>
              </li>
            </ul>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => toggleDropdown('otros')}
            aria-expanded={isOtrosOpen}
            aria-controls="mobile-otros-menu"
            className="flex justify-center items-center space-x-1 text-sgreen w-full py-2 hover:bg-gray-200 transition"
          >
            <span>Otros</span>
            <FaAngleDown className={`${isOtrosOpen ? 'rotate-180' : ''} transition-transform`} />
          </button>
          {isOtrosOpen && (
            <ul id="mobile-otros-menu" className="flex flex-col bg-gray-100 border-t border-gray-300 space-y-1">
              <li>
                <Link to={ROUTES.TESTIMONIALS} className="text-sgreen py-2 px-4 hover:bg-gray-200 transition" onClick={handleClose}>
                  Reseñas
                </Link>
              </li>
              <li>
                <Link to={ROUTES.FAQ} className="text-sgreen py-2 px-4 hover:bg-gray-200 transition" onClick={handleClose}>
                  FAQ
                </Link>
              </li>
              <li>
                <Link to={ROUTES.BLOG} className="text-sgreen py-2 px-4 hover:bg-gray-200 transition" onClick={handleClose}>
                  Blog
                </Link>
              </li>
            </ul>
          )}
        </div>

        <Link to={ROUTES.ABOUT} className="text-sgreen hover:bg-gray-200 py-2 rounded transition" onClick={handleClose}>
          Quiénes Somos
        </Link>
      </nav>
    </div>
  );
};

export default MobileMenu;